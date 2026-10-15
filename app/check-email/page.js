"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { PageLoader } from "@/components/Loader";
import { resendVerification } from "../lib/api";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function CheckEmail() {
  const email = useSearchParams().get("email") || "";
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null); // { type: "success" | "error", text }

  async function handleResend() {
    if (!email || sending) return;
    setSending(true);
    setStatus(null);
    try {
      await resendVerification(email);
      setStatus({ type: "success", text: "Email sent. Please check your inbox for the verification link." });
    } catch (err) {
      setStatus({ type: "error", text: err.message || "Could not send the email. Please try again." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* top bar */}
      <header className="border-b border-slate-200 px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-800 text-sm font-bold text-white">
            C
          </span>
          ClinicBook
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-6 pt-16 text-center sm:pt-24">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          <span className="text-teal-800">Almost there!</span> Check your email
        </h1>

        {/* email box */}
        <div className="mt-10 flex w-full max-w-xl items-center justify-between gap-4 rounded-2xl bg-slate-100 px-6 py-5">
          <span className="min-w-0 truncate text-lg font-medium text-slate-900 underline sm:text-2xl">
            {email || "your email address"}
          </span>
          <span className="shrink-0 text-slate-800">
            <MailIcon />
          </span>
        </div>

        <p className="mt-10 max-w-xl text-sm leading-6 text-slate-700 sm:text-base">
          A verification link has been sent to {email ? <strong>{email}</strong> : "your email address"}.
          <br className="hidden sm:block" />{" "}
          Please click on the link to verify your email and continue your account setup.
        </p>
        <p className="mt-1 text-xs text-slate-500">The link expires in 24 hours.</p>

        {/* actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={!email || sending}
            className="rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? "Sending..." : "Resend email"}
          </button>
          <Link
            href="/register"
            className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
          >
            Update email
          </Link>
        </div>

        {/* feedback */}
        {status && (
          <div
            role={status.type === "error" ? "alert" : "status"}
            className={`mt-6 w-full max-w-xl rounded-xl border px-4 py-3 text-sm ${
              status.type === "success"
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-red-300 bg-red-50 text-red-700"
            }`}
          >
            {status.text}
          </div>
        )}

        <Link href="/login" className="mt-10 text-sm text-teal-800 hover:underline">
          Back to log in
        </Link>
      </main>
    </div>
  );
}

// useSearchParams needs a Suspense boundary in the App Router
export default function CheckEmailPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <CheckEmail />
    </Suspense>
  );
}