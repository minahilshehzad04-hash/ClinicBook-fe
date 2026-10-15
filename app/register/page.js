"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import AuthButton from "@/components/AuthButton";
import AuthShell from "@/components/AuthShell";
import Field from "@/components/Field";
import { PageLoader } from "@/components/Loader";
import { fieldError, isLoggedIn, registerPatient } from "../lib/api";

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  date_of_birth: "",
  password: "",
  confirm_password: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [agreed, setAgreed] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true); // are we already logged in?

  useEffect(() => {
    if (isLoggedIn()) router.replace("/dashboard");
    else setChecking(false);
  }, [router]);

  const update = (event) =>
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    if (!agreed) {
      setTermsError(true);
      return;
    }
    setTermsError(false);
    setLoading(true);
    try {
      await registerPatient(form); // creates the account + emails a verification link
      router.push(`/check-email?email=${encodeURIComponent(form.email.trim())}`);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }

  if (checking) return <PageLoader label="Just a moment..." />;

  const isValidationError = error?.code === "validation_error";
  const err = (name) => (isValidationError ? fieldError(error, name) : undefined);
  const generalError = isValidationError ? fieldError(error, "non_field_errors") : null;

  return (
    <AuthShell title="Sign up">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex gap-3">
          <Field label="First name" name="first_name" className="flex-1" autoComplete="given-name"
            value={form.first_name} onChange={update} error={err("first_name")} />
          <Field label="Last name" name="last_name" className="flex-1" autoComplete="family-name"
            value={form.last_name} onChange={update} error={err("last_name")} />
        </div>

        <Field label="Email" name="email" type="email" autoComplete="email"
          value={form.email} onChange={update} error={err("email")} />
        <Field label="Phone number" name="phone" type="tel" autoComplete="tel"
          value={form.phone} onChange={update} error={err("phone")} />
        <Field label="Date of birth" name="date_of_birth" type="date" showLabel
          autoComplete="bday"
          value={form.date_of_birth} onChange={update} error={err("date_of_birth")} />
        <Field label="Password" name="password" type="password" autoComplete="new-password"
          value={form.password} onChange={update} error={err("password")} />
        <Field label="Confirm password" name="confirm_password" type="password"
          autoComplete="new-password"
          value={form.confirm_password} onChange={update} error={err("confirm_password")} />

        <div>
          <label className="flex items-center gap-3 text-xs text-slate-700">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 accent-teal-800"
            />
            <span>
              I agree to ClinicBook&apos;s{" "}
              <Link href="/terms" className="underline">Terms of Service</Link> and{" "}
              <Link href="/privacy" className="underline">Privacy Policy</Link>
            </span>
          </label>
          {termsError && (
            <p className="mt-1 text-xs text-red-600">Please accept the terms to continue.</p>
          )}
        </div>

        {error && !isValidationError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error.message}
          </p>
        )}
        {generalError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {generalError}
          </p>
        )}

        <div className="mt-2">
          <AuthButton loading={loading} loadingText="Creating account...">
            Get started
          </AuthButton>
        </div>
      </form>

      <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-8">
        <span className="text-slate-800">Already have an account?</span>
        <Link
          href="/login"
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-slate-900 transition hover:bg-slate-50"
        >
          Log in
        </Link>
      </div>
    </AuthShell>
  );
}
