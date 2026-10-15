import Logo from "@/components/Logo";

const BENEFITS = [
  "Book a visit in under a minute, day or night.",
  "See real open slots for every doctor.",
  "Get text and email reminders before each visit.",
  "Reschedule or cancel without calling the clinic.",
];

/** Shared two-column layout: header, marketing copy on the left, form card on the right. */
export default function AuthShell({ title, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-slate-200 px-5 py-3 sm:px-8">
        <Logo />
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-5 py-10 lg:grid-cols-[1.15fr_1fr] lg:gap-24 lg:py-16">
        <section>
          <h1 className="text-4xl font-medium leading-tight text-slate-900 sm:text-5xl">
            Over <span className="text-teal-800">10,000 patients</span> book
            <br className="hidden sm:block" /> their care with ClinicBook
          </h1>
          <p className="mt-6 text-lg text-slate-600">
            Free for patients. No credit card required.
          </p>

          <ul className="mt-8 space-y-3 text-lg text-slate-800">
            {BENEFITS.map((text) => (
              <li key={text} className="flex gap-3">
                <span className="text-teal-800" aria-hidden="true">✓</span>
                {text}
              </li>
            ))}
          </ul>

          <dl className="mt-12 flex gap-10">
            {[
              ["4.8/5", "Patient rating"],
              ["24/7", "Online booking"],
              ["< 1 min", "To book a slot"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="text-2xl font-semibold text-slate-900">{value}</dt>
                <dd className="text-sm text-slate-600">{label}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="w-full max-w-md lg:justify-self-end">
          <h2 className="mb-6 text-3xl font-medium text-slate-900">{title}</h2>
          {children}
        </section>
      </main>
    </div>
  );
}
