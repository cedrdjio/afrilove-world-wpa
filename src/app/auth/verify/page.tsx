"use client";

import { useSearchParams } from "next/navigation";

import {
  VerifyOtpScreen,
  type VerifyMode,
} from "@/features/auth/components/verify-otp-screen";

export default function VerifyOtpPage() {
  const params = useSearchParams();
  const mode: VerifyMode =
    params.get("type") === "recovery" ? "recovery" : "signup";
  return <VerifyOtpScreen email={params.get("email")} mode={mode} />;
}
