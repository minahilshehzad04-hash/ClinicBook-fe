import Logo from "@/components/Logo";

/** Centered card on a plain page: used for "check your email" and "verifying" screens. */
export default function CenterCard({ icon, title, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-slate-200 px-5 py-3 sm:px-8">
        <Logo />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
          {icon && <div className="mb-5 flex justify-center">{icon}</div>}
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          <div className="mt-3 text-slate-600">{children}</div>
        </section>
      </main>
    </div>
  );
}

export const MailIcon = (
  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-800">
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  </span>
);

export const CheckIcon = (
  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-800">
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor"
      strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  </span>
);

export const CrossIcon = (
  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor"
      strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  </span>
);
