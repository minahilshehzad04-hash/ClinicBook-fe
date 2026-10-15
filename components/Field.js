"use client";

import { useId, useState } from "react";

const EyeIcon = ({ off }) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M3 3l18 18" />}
  </svg>
);

/**
 * Text input with the label shown as a placeholder (screen-reader label kept),
 * a red outline + helper text on error, and a show/hide toggle for passwords.
 * Pass `showLabel` for inputs where a placeholder can't work (e.g. type="date").
 */
export default function Field({
  label,
  name,
  type = "text",
  error,
  className = "",
  showLabel = false,
  id,
  ...rest
}) {
  const autoId = useId();
  const inputId = id || autoId;
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className={showLabel ? "mb-1 block text-sm text-slate-600" : "sr-only"}
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={isPassword && visible ? "text" : type}
          placeholder={showLabel ? undefined : label}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`h-12 w-full rounded-lg border bg-white px-4 text-base text-slate-900
            placeholder:text-slate-500 outline-none transition
            focus:ring-2 ${isPassword ? "pr-12" : ""}
            ${error
              ? "border-red-600 focus:ring-red-200"
              : "border-slate-300 focus:border-teal-700 focus:ring-teal-100"}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 hover:text-slate-800"
          >
            <EyeIcon off={visible} />
          </button>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}