"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import AuthButton from "@/components/AuthButton";
import AuthShell from "@/components/AuthShell";
import { PageLoader } from "@/components/Loader";
import {
  getSavedRole,
  homeFor,
  isLoggedIn,
  login,
  logout,
  resendVerification,
} from "../lib/api";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900";

function EyeIcon({ off }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M3 3l18 18" />}
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const verified = useSearchParams().get("verified") === "1";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null); // { message, code }
  const [notice, setNotice] = useState(null); // e.g. "verification email sent"
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true); // already logged in?

  // Already signed in? Go to the home page of their role.
  useEffect(() => {
    if (isLoggedIn()) router.replace(homeFor(getSavedRole()) || "/dashboard");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage can only be read after mount
    else setChecking(false);
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const user = await login(identifier.trim(), password);

      // The account decides where to go: no role tabs needed.
      const home = homeFor(user?.role);
      if (!home) {
        // e.g. the admin: no frontend page yet, they use the backend /admin/ site.
        await logout();
        setError({ message: "This account type does not sign in here.", code: "no_home" });
        setLoading(false);
        return;
      }
      router.push(home);
    } catch (err) {
      setError({ message: err.message || "Could not log in.", code: err.code });
      setLoading(false);
    }
  }

  // Backend answered "email_not_verified": offer to send the link again.
  async function handleResend() {
    setNotice(null);
    try {
      await resendVerification(identifier.trim());
      setNotice("If that account needs verifying, a new email is on its way.");
    } catch (err) {
      setNotice(err.message || "Could not send the email. Try again later.");
    }
  }

  if (checking) return <PageLoader label="Just a moment..." />;

  const canResend = error?.code === "email_not_verified" && identifier.includes("@");

  return (
    <AuthShell title="Welcome back">
      {verified && (
        <p role="status" className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Email verified. You can log in now.
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <input
          type="text"
          name="identifier"
          autoComplete="username"
          placeholder="Email or phone number"
          aria-label="Email or phone number"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className={inputClass}
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            placeholder="Password"
            aria-label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
          >
            <EyeIcon off={showPassword} />
          </button>
        </div>

        {error && (
          <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            <p>{error.message}</p>
            {canResend && (
              <button type="button" onClick={handleResend} className="mt-1 underline">
                Resend verification email
              </button>
            )}
          </div>
        )}

        {notice && (
          <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {notice}
          </p>
        )}

        <AuthButton loading={loading} loadingText="Signing in...">
          Sign in
        </AuthButton>
      </form>

      <p className="mt-6 text-center text-sm text-slate-700">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="underline">Sign up</Link>
      </p>
    </AuthShell>
  );
}

// useSearchParams needs a Suspense boundary in the App Router
export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <LoginForm />
    </Suspense>
  );
}