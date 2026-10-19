"use client";

import { useState } from "react";
import { ApiError, fieldError } from "@/app/lib/api";

const input =
  "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none";

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-500">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

const orNull = (v) => (v === "" || v == null ? null : v);

export default function EditProfileForm({ user, profile, submit, onSaved, onCancel }) {
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const err = (f) => fieldError(error, f);

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      first_name: fd.get("first_name"),
      last_name: fd.get("last_name"),
      phone: fd.get("phone"),
      date_of_birth: orNull(fd.get("date_of_birth")),
    };
    if (profile) {
      Object.assign(body, {
        specialty: fd.get("specialty"),
        qualification: fd.get("qualification"),
        years_of_experience: orNull(fd.get("years_of_experience")),
        license_number: fd.get("license_number"),
        consultation_fee: orNull(fd.get("consultation_fee")),
        bio: fd.get("bio"),
      });
    }

    setSaving(true);
    setError(null);
    try {
      await submit(body);
      onSaved();
    } catch (e2) {
      setError(e2 instanceof ApiError ? e2 : new ApiError("Something went wrong."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6"
    >
      <div>
        <h3 className="text-base font-semibold text-slate-900">Personal information</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="First name" error={err("first_name")}>
            <input name="first_name" defaultValue={user.first_name} required className={input} />
          </Field>
          <Field label="Last name" error={err("last_name")}>
            <input name="last_name" defaultValue={user.last_name} required className={input} />
          </Field>
          <Field label="Phone" error={err("phone")}>
            <input name="phone" defaultValue={user.phone ?? ""} className={input} />
          </Field>
          <Field label="Date of birth" error={err("date_of_birth")}>
            <input
              name="date_of_birth"
              type="date"
              defaultValue={user.date_of_birth ?? ""}
              className={input}
            />
          </Field>
        </div>
      </div>

      {profile && (
        <div>
          <h3 className="text-base font-semibold text-slate-900">Professional details</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Specialty" error={err("specialty")}>
              <input name="specialty" defaultValue={profile.specialty} className={input} />
            </Field>
            <Field label="Qualification" error={err("qualification")}>
              <input name="qualification" defaultValue={profile.qualification} className={input} />
            </Field>
            <Field label="Years of experience" error={err("years_of_experience")}>
              <input
                name="years_of_experience"
                type="number"
                min="0"
                max="70"
                defaultValue={profile.years_of_experience ?? ""}
                className={input}
              />
            </Field>
            <Field label="License number" error={err("license_number")}>
              <input
                name="license_number"
                defaultValue={profile.license_number ?? ""}
                className={input}
              />
            </Field>
            <Field label="Consultation fee (Rs)" error={err("consultation_fee")}>
              <input
                name="consultation_fee"
                type="number"
                min="0"
                step="0.01"
                defaultValue={profile.consultation_fee ?? ""}
                className={input}
              />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="About" error={err("bio")}>
              <textarea
                name="bio"
                rows={4}
                maxLength={1000}
                defaultValue={profile.bio}
                className={input}
              />
            </Field>
          </div>
        </div>
      )}

      {error && !error.details && <p className="text-sm text-red-600">{error.message}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-teal-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? "Updating..." : "Update profile"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}