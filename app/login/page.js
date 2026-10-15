"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import AuthButton from "@/components/AuthButton";
import AuthShell from "@/components/AuthShell";
import { PageLoader } from "@/components/Loader";
import { isLoggedIn, login, logout } from "../lib/api";

const ROLES = [
  { value: "patient", label: "Patient" },
  { value: "doctor", label: "Doctor" },
];

// Where each role lands after logging in.
const HOME = { patient: "/dashboard", doctor: "/doctor/dashboard" };
const ROLE_KEY = "clinicbook_role";
const homeFor = (role) => HOME[role] || "/dashboard";

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

  const [role, setRole] = useState("patient");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true); // already logged in?

  useEffect(() => {
    if (isLoggedIn()) {
      let saved = null;
      try { saved = localStorage.getItem(ROLE_KEY); } catch {}
      router.replace(homeFor(saved));
    } else setChecking(false);
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(identifier.trim(), password);

      // If the backend returns a role and it differs from the selected tab, sign out again.
      if (user?.role && user.role !== role) {
        await logout();
        setError(`This account is not a ${role} account. Choose the other tab.`);
        setLoading(false);
        return;
      }
      const actualRole = user?.role || role;
      try { localStorage.setItem(ROLE_KEY, actualRole); } catch {}
      router.push(homeFor(actualRole));
    } catch (err) {
      setError(err.message || "Could not log in.");
      setLoading(false);
    }
  }

  if (checking) return <PageLoader label="Just a moment..." />;

  return (
    <AuthShell title="Welcome back">
      {verified && (
        <p role="status" className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Email verified. You can log in now.
        </p>
      )}

      {/* role toggle */}
      <div role="tablist" aria-label="Log in as" className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-slate-200 p-1">
        {ROLES.map((r) => {
          const active = role === r.value;
          return (
            <button
              key={r.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => { setRole(r.value); setError(null); }}
              className={`rounded-md py-2.5 text-sm font-medium transition ${
                active ? "bg-black text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>

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
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
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