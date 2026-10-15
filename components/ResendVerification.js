"use client";

import { useEffect, useState } from "react";

import Field from "./Field";
import { Spinner } from "./Loader";
import { resendVerification } from "../app/lib/api";

/** "Resend email" button with a 60 s cooldown. Asks for the email if it isn't known. */
export default function ResendVerification({ email: knownEmail = "" }) {
  const [email, setEmail] = useState(knownEmail);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleResend() {
    setError(null);
    setSent(false);
    setSending(true);
    try {
      await resendVerification(email.trim());
      setSent(true);
      setCooldown(60);
    } catch (err) {
      setError(err.status === 429 ? "Too many requests. Please try again later." : err.message);
    } finally {
      setSending(false);
    }
  }

  const disabled = sending || cooldown > 0 || !email.trim();

  return (
    <div className="mt-6 flex flex-col gap-3 text-left">
      {!knownEmail && (
        <Field label="Email" name="email" type="email" autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)} />
      )}

      <button
        type="button"
        onClick={handleResend}
        disabled={disabled}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-300
          font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {sending && <Spinner />}
        {cooldown > 0 ? `Resend available in ${cooldown}s` : "Resend verification email"}
      </button>

      {sent && (
        <p role="status" className="text-center text-sm text-teal-800">
          Sent! Check your inbox (and spam folder).
        </p>
      )}
      {error && <p role="alert" className="text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}
