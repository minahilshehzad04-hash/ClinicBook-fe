// Shown instead of a dashboard when loading it failed (e.g. wrong role, server down).
export default function DashboardError({ error, onLogout }) {
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-red-700">
        {error.message}
      </p>
      <button
        type="button"
        onClick={onLogout}
        className="mt-4 rounded-lg border border-slate-300 px-5 py-2.5 text-slate-900 transition hover:bg-slate-50"
      >
        Back to login
      </button>
    </main>
  );
}