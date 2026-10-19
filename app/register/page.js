"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import AuthButton from "@/components/AuthButton";
import AuthShell from "@/components/AuthShell";
import Field from "@/components/Field";
import { clearTokens, fieldError, registerPatient } from "../lib/api";

const ROLES = [
  { value: "patient", label: "Patient" },
  { value: "doctor", label: "Doctor" },
];

const EMPTY_FORM = {
  role: "patient",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  date_of_birth: "",
  password: "",
  confirm_password: "",
};

// Fields that have their own input on this page. Errors for any OTHER field
// (e.g. "username") are shown in a banner so they are never invisible.
const SHOWN_FIELDS = [
  "first_name", "last_name", "email", "phone", "date_of_birth",
  "password", "confirm_password", "non_field_errors",
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [agreed, setAgreed] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [localErrors, setLocalErrors] = useState({}); // checked in the browser
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (event) =>
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    // The backend does not compare the two password boxes, so check here.
    const problems = {};
    if (form.password !== form.confirm_password) {
      problems.confirm_password = "Passwords do not match.";
    }
    setLocalErrors(problems);
    if (!agreed) setTermsError(true);
    else setTermsError(false);
    if (Object.keys(problems).length || !agreed) return;

    setLoading(true);
    try {
      const email = form.email.trim().toLowerCase();
      // The backend requires a username; patients log in with email/phone,
      // so the email doubles as the username.
      await registerPatient({ ...form, email, username: email });
      clearTokens();
      router.push(`/check-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }

  const isValidationError = error?.code === "validation_error";
  const err = (name) =>
    localErrors[name] || (isValidationError ? fieldError(error, name) : undefined);
  const generalError = isValidationError ? fieldError(error, "non_field_errors") : null;
  const otherErrors = isValidationError
    ? Object.keys(error.details || {})
        .filter((key) => !SHOWN_FIELDS.includes(key))
        .map((key) => fieldError(error, key))
    : [];

  return (
    <AuthShell title="Sign up">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {/* Patient / Doctor choice. The backend accepts only these two roles. */}
        <div>
          <p className="mb-1 text-sm text-slate-700">I am a</p>
          <div role="radiogroup" aria-label="I am a" className="grid grid-cols-2 gap-1 rounded-lg bg-slate-200 p-1">
            {ROLES.map((r) => {
              const active = form.role === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setForm((current) => ({ ...current, role: r.value }))}
                  className={`rounded-md py-2.5 text-sm font-medium transition ${
                    active ? "bg-black text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

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
        {otherErrors.map((message, i) => (
          <p key={i} role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {message}
          </p>
        ))}

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