"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys, queryRoots } from "@/lib/query-keys";
import { useAuth } from "@/providers/auth-provider";
import { useSupabase } from "@/providers/supabase-provider";
import {
  fetchConversations,
  fetchMessages,
  markConversationRead,
  sendMessage,
  subscribeToMessages,
  unsubscribe,
} from "@/features/messaging/service";
import type { ChatMessage } from "@/features/messaging/types";

export function useConversationsQuery() {
  const supabase = useSupabase();
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.conversations(user?.id),
    queryFn: () => fetchConversations(supabase, user!.id),
    enabled: Boolean(user?.id),
    staleTime: 15_000,
  });
}

/**
 * Messages d'une conversation, maintenus en direct : la page initiale vient de
 * la requête, puis les inserts Realtime sont ajoutés directement au cache —
 * aucun polling, aucun refetch à chaque message. Port de `useMessagesQuery`.
 */
export function useMessagesQuery(matchId: string | undefined) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.messages(matchId ?? ""),
    queryFn: () => fetchMessages(supabase, matchId!),
    enabled: Boolean(user?.id) && Boolean(matchId),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!matchId || !user?.id) return;

    const channel = subscribeToMessages(supabase, matchId, (message) => {
      queryClient.setQueryData<ChatMessage[]>(
        queryKeys.messages(matchId),
        (current) => {
          if (!current) return [message];
          // L'expéditeur l'a déjà ajouté en optimiste — dédup par id.
          if (current.some((m) => m.id === message.id)) return current;
          return [...current, message];
        },
      );
      // Un message entrant du partenaire, chat ouvert, est lu instantanément.
      if (message.senderId !== user.id) {
        void markConversationRead(supabase, matchId).catch(() => {});
        queryClient.invalidateQueries({
          queryKey: [queryRoots.conversations],
        });
      }
    });

    return () => unsubscribe(supabase, channel);
  }, [matchId, user?.id, queryClient, supabase]);

  return query;
}

export function useSendMessage(matchId: string | undefined) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => {
      if (!user || !matchId) throw new Error("Conversation indisponible");
      return sendMessage(supabase, matchId, user.id, content);
    },
    onSuccess: (message) => {
      queryClient.setQueryData<ChatMessage[]>(
        queryKeys.messages(matchId ?? ""),
        (current) => {
          if (!current) return [message];
          if (current.some((m) => m.id === message.id)) return current;
          return [...current, message];
        },
      );
      queryClient.invalidateQueries({ queryKey: [queryRoots.conversations] });
    },
  });
}

/** Marque les messages du partenaire lus à l'ouverture du chat. */
export function useMarkConversationRead(
  matchId: string | undefined,
  unreadHint?: number,
) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!matchId) return;
    void markConversationRead(supabase, matchId)
      .then(() =>
        queryClient.invalidateQueries({
          queryKey: [queryRoots.conversations],
        }),
      )
      .catch(() => {});
    // unreadHint re-déclenche si de nouveaux non-lus arrivent écran monté.
  }, [matchId, unreadHint, queryClient, supabase]);
}
