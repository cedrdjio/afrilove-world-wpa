"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { m } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";

import { ScreenBackground } from "@/components/layout/screen-background";
import { GlowOrb } from "@/components/layout/glow-orb";
import { Avatar } from "@/components/ui/avatar";
import { GradientButton } from "@/components/ui/gradient-button";
import { GhostButton } from "@/components/ui/ghost-button";
import { ROUTES } from "@/constants/routes";
import { useProfileQuery } from "@/features/profile/hooks/use-profile";

function Confetti({
  top,
  left,
  right,
  delay,
  color,
  size = 8,
}: {
  top: number;
  left?: number;
  right?: number;
  delay: number;
  color: string;
  size?: number;
}) {
  return (
    <m.span
      aria-hidden
      className="absolute rounded-[2px]"
      style={{ top, left, right, width: size, height: size, background: color }}
      animate={{ y: [0, -14, 0], opacity: [0.5, 0.9, 0.5] }}
      transition={{
        duration: 3.6,
        delay: delay / 1000,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

function CelebrationContent() {
  const router = useRouter();
  const params = useSearchParams();
  const matchName = params.get("name") ?? "";
  const myProfile = useProfileQuery().data;

  // Le chat temps réel arrive au Jalon 9 : sans conversation en cache, « Dis
  // bonjour » ouvre la liste des messages — exactement le repli du mobile.
  const openChat = () => router.replace(ROUTES.messages);

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <ScreenBackground theme="deep" halos={false}>
        <GlowOrb
          size={340}
          color="rgba(139,105,214,0.3)"
          top={110}
          left={20}
          duration={7}
        />
        <GlowOrb
          size={240}
          color="rgba(155,126,222,0.2)"
          bottom={190}
          right={-20}
          duration={9}
          delay={1.5}
        />
      </ScreenBackground>

      <Confetti top={90} left={55} delay={0} color="#B79CE8" />
      <Confetti top={130} right={65} delay={600} color="#D99B2B" size={7} />
      <Confetti
        top={72}
        left={170}
        delay={1200}
        color="rgba(255,255,255,0.8)"
        size={5}
      />
      <Confetti top={108} right={130} delay={400} color="#E7C77A" size={10} />

      <div className="relative z-10 -mt-8 flex flex-1 flex-col items-center justify-center px-7">
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-9 flex flex-col items-center"
        >
          <p className="font-display mb-2 text-center text-[12px] tracking-[5px] text-[#D99B2B]">
            Coup de cœur mutuel
          </p>
          <h1 className="font-display text-center text-[46px] leading-none font-black tracking-wide text-white">
            C&apos;est un
            <br />
            match !
          </h1>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center"
        >
          <m.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="z-20 overflow-hidden rounded-full border-[3px] border-white/55"
          >
            <Avatar
              src={myProfile?.avatarUrl ?? undefined}
              seed={myProfile?.firstName ?? "moi"}
              size={96}
            />
          </m.div>
          <m.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.35, duration: 0.38 }}
            className="gradient-signature z-30 -mx-3 grid size-[42px] place-items-center rounded-full border-2 border-white/40 text-white shadow-[0_6px_16px_rgba(91,62,158,0.6)]"
          >
            <Heart className="size-[19px] fill-current" aria-hidden />
          </m.span>
          <div className="overflow-hidden rounded-full border-[3px] border-white/35">
            <Avatar seed={matchName} size={96} />
          </div>
        </m.div>

        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 text-center text-[14px] leading-[22px] text-white/50"
        >
          Toi et{" "}
          <span className="font-semibold text-white/85">
            {matchName || "ce profil"}
          </span>{" "}
          vous êtes plu.
          <br />
          Lancez la conversation.
        </m.p>
      </div>

      <m.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="relative z-10 px-7 pb-12"
      >
        <GradientButton
          label={
            matchName ? `Dis bonjour à ${matchName}` : "Envoyer un message"
          }
          icon={<MessageCircle className="size-4" aria-hidden />}
          iconPosition="left"
          className="mb-3"
          onClick={openChat}
        />
        <GhostButton
          label="Continuer à découvrir"
          tone="onDark"
          onClick={() => router.replace(ROUTES.discover)}
        />
      </m.div>
    </div>
  );
}

export default function MatchCelebrationPage() {
  return (
    <Suspense fallback={null}>
      <CelebrationContent />
    </Suspense>
  );
}
