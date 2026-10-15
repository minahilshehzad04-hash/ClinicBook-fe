import { LogoMark } from "@/components/Logo";

/**
 * Small spinning ring. Inherits the text color (currentColor), so it works
 * inside buttons (white) and on cards (teal) without extra props.
 */
export function Spinner({ size = "h-5 w-5", className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${size} ${className}`}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Spinner + text, for loading a section of a page (lists, cards, tables). */
export function InlineLoader({ label = "Loading..." }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 py-6 text-teal-800">
      <Spinner size="h-6 w-6" />
      <span className="text-sm text-slate-600">{label}</span>
    </div>
  );
}

/** Full-screen loader: pulsing logo mark with a label. Use while a whole page is not ready. */
export function PageLoader({ label = "Loading..." }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen flex-col items-center justify-center gap-5 bg-white"
    >
      <div className="relative flex h-20 w-20 items-center justify-center">
        <Spinner size="absolute inset-0 h-20 w-20" className="text-teal-700" />
        <LogoMark className="h-10 w-10 animate-pulse" />
      </div>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}

export default Spinner;
