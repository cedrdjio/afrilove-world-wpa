"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { Ban, RefreshCcw, UserX } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { ScreenBackground } from "@/components/layout/screen-background";
import { GlowOrb } from "@/components/layout/glow-orb";
import { GradientButton } from "@/components/ui/gradient-button";
import { GhostButton } from "@/components/ui/ghost-button";
import { FullScreenLoader } from "@/components/feedback/full-screen-loader";
import { useAuth } from "@/providers/auth-provider";
import { useSupabase } from "@/providers/supabase-provider";

/**
 * Le « voyant » des comptes non actifs — port de `AccountStatusScreen`
 * (mobile). Un membre suspendu (banned) en est informé et ne peut que se
 * déconnecter : le trigger DB rend l'auto-déblocage impossible, même via
 * l'API brute. Un membre auto-désactivé (deleted) peut se réactiver, ce qui
 * remet simplement `account_status = 'active'`.
 */
export default function AccountStatusPage() {
  const router = useRouter();
  const supabase = useSupabase();
  const { user, profile, isLoading, refreshProfile, signOut } = useAuth();
  const [reactivating, setReactivating] = useState(false);

  const status = profile?.account_status;
  const isBanned = status === "banned";

  // Écran réservé aux comptes non actifs : un compte redevenu actif (ou une
  // session absente) n'a rien à faire ici.
  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace(ROUTES.home);
    else if (profile && profile.account_status === "active")
      router.replace(ROUTES.discover);
  }, [isLoading, user, profile, router]);

  const reactivate = async () => {
    if (!user) return;
    setReactivating(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ account_status: "active" })
        .eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      router.replace(ROUTES.discover);
    } finally {
      setReactivating(false);
    }
  };

  const handleSignOut = async () => {
    await signOut().catch(() => {});
    router.replace(ROUTES.home);
  };

  if (isLoading || !profile) return <FullScreenLoader />;

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScreenBackground theme="deep" halos={false}>
        <GlowOrb
          size={260}
          color={isBanned ? "rgba(194,69,69,0.18)" : "rgba(155,126,222,0.14)"}
          top={120}
          left={-40}
          duration={9}
        />
      </ScreenBackground>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8">
        <m.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={cnBadge(isBanned)}
        >
          {isBanned ? (
            <Ban
              className="size-10 text-[#C24545]"
              strokeWidth={1.6}
              aria-hidden
            />
          ) : (
            <UserX
              className="text-gold size-10"
              strokeWidth={1.6}
              aria-hidden
            />
          )}
        </m.span>

        <h1 className="font-display mb-3 text-center text-[28px] font-extrabold text-white">
          {isBanned ? "Compte suspendu" : "Compte désactivé"}
        </h1>
        <p className="mb-6 max-w-sm text-center text-[13.5px] leading-[21px] text-white/50">
          {isBanned
            ? "Votre compte a été suspendu pour non-respect de nos conditions d’utilisation."
            : "Vous avez désactivé votre compte. Vos données sont conservées et votre profil est invisible."}
        </p>

        {isBanned && profile.status_reason ? (
          <div className="mb-8 w-full max-w-sm rounded-2xl border border-white/[0.14] bg-white/[0.08] p-4">
            <p className="font-display mb-1 text-[10px] text-white/40">Motif</p>
            <p className="text-[12.5px] leading-[18px] text-white/80">
              {profile.status_reason}
            </p>
          </div>
        ) : null}

        <div className="flex w-full max-w-xs flex-col items-center gap-3">
          {!isBanned ? (
            <GradientButton
              label="Réactiver mon compte"
              icon={<RefreshCcw className="size-4" aria-hidden />}
              iconPosition="left"
              loading={reactivating}
              onClick={() => void reactivate()}
            />
          ) : null}
          <GhostButton
            label="Se déconnecter"
            tone="onDark"
            block={false}
            onClick={() => void handleSignOut()}
          />
        </div>
      </div>
    </div>
  );
}

function cnBadge(isBanned: boolean): string {
  return [
    "mb-7 flex size-24 items-center justify-center rounded-full border-[1.5px]",
    isBanned
      ? "border-[#C24545]/30 bg-[#C24545]/[0.12]"
      : "border-gold/30 bg-gold/[0.1]",
  ].join(" ");
}
