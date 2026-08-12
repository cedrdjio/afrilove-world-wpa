"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/providers/auth-provider";

import { messagingService, type LiveMessage } from "./service";

export const CONVERSATIONS_QUERY_KEY = "conversations" as const;
export const MESSAGES_QUERY_KEY = "messages" as const;

export function useConversationsQuery() {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: [CONVERSATIONS_QUERY_KEY, user?.id],
    queryFn: () => messagingService.fetchConversations(user!.id),
    enabled: isAuthenticated && Boolean(user?.id),
    staleTime: 15_000,
  });
}

/**
 * Messages d'une conversation, maintenus en direct : la page initiale vient de
 * la requête, puis les inserts Realtime sont ajoutés directement dans le cache
 * — aucun polling, aucun refetch à chaque message.
 */
export function useMessagesQuery(matchId: string | undefined) {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [MESSAGES_QUERY_KEY, matchId],
    queryFn: () => messagingService.fetchMessages(matchId!),
    enabled: isAuthenticated && Boolean(matchId),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!matchId || !isAuthenticated) return;

    const channel = messagingService.subscribeToMessages(matchId, (message) => {
      queryClient.setQueryData<LiveMessage[]>(
        [MESSAGES_QUERY_KEY, matchId],
        (current) => {
          if (!current) return [message];
          if (current.some((m) => m.id === message.id)) return current;
          return [...current, message];
        },
      );
      // Un message entrant du partenaire pendant que le chat est ouvert est lu.
      if (message.senderId !== user?.id) {
        messagingService.markConversationRead(matchId).catch(() => {});
        queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
      }
    });

    return () => messagingService.unsubscribe(channel);
  }, [matchId, isAuthenticated, queryClient, user?.id]);

  return query;
}

export function useSendMessage(matchId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => {
      if (!user || !matchId) throw new Error("Conversation indisponible");
      return messagingService.sendMessage(matchId, user.id, content);
    },
    onSuccess: (message) => {
      queryClient.setQueryData<LiveMessage[]>(
        [MESSAGES_QUERY_KEY, matchId],
        (current) => {
          if (!current) return [message];
          if (current.some((m) => m.id === message.id)) return current;
          return [...current, message];
        },
      );
      queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });
    },
  });
}

/** Marque les messages du partenaire comme lus à l'ouverture du chat. */
export function useMarkConversationRead(
  matchId: string | undefined,
  unreadHint?: number,
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!matchId) return;
    messagingService
      .markConversationRead(matchId)
      .then(() =>
        queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] }),
      )
      .catch(() => {});
  }, [matchId, unreadHint, queryClient]);
}
