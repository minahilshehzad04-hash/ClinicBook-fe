import { Spinner } from "@/components/Loader";

export default function AuthButton({ loading, loadingText, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      aria-busy={loading}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-teal-900
        text-base font-semibold text-white shadow-lg shadow-slate-400/40 transition
        hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2
        focus-visible:outline-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading && <Spinner />}
      {loading ? loadingText : children}
    </button>
  );
}
