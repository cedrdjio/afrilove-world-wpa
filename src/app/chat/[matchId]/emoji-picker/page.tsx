"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { ScreenBackground } from "@/components/layout/screen-background";
import { useChatComposerStore } from "@/features/messaging/stores/composer-store";

const EMOJIS = [
  "😀",
  "😂",
  "😍",
  "🥰",
  "😘",
  "😊",
  "😉",
  "🤗",
  "🙌",
  "👏",
  "🔥",
  "💯",
  "✨",
  "🌟",
  "❤️",
  "💕",
  "💖",
  "💗",
  "💛",
  "💚",
  "🙏",
  "👍",
  "🎉",
  "🎶",
  "🌍",
  "☕",
  "🍲",
  "💃",
  "⚽",
  "📚",
];

/** Sélecteur d'emojis plein écran — port de `EmojiPickerScreen` (mobile).
 *  L'emoji choisi est mis en file dans le composeur puis on revient au chat. */
export default function EmojiPickerPage() {
  const router = useRouter();
  const setPendingEmoji = useChatComposerStore((s) => s.setPendingEmoji);

  const pick = (emoji: string) => {
    setPendingEmoji(emoji);
    router.back();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <ScreenBackground theme="cream" />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-8 pb-8">
        <div className="mb-4 flex items-center justify-between px-2">
          <h1 className="font-display text-foreground text-[22px]">Emojis</h1>
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Fermer"
            className="border-border/70 bg-card/80 text-foreground grid size-10 place-items-center rounded-full border"
          >
            <X className="size-[17px]" aria-hidden />
          </button>
        </div>

        <div className="grid grid-cols-6 gap-1">
          {EMOJIS.map((emoji, i) => (
            <button
              key={`${emoji}-${i}`}
              type="button"
              onClick={() => pick(emoji)}
              className="hover:bg-card/60 grid place-items-center rounded-2xl py-3 text-[28px] transition-colors active:opacity-60"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
