"use client";

export const CLINIC_TZ = "Asia/Karachi";

// ---------- helpers ----------
export const fmt = (iso, opts) =>
  new Date(iso).toLocaleString("en-US", { ...opts, timeZone: CLINIC_TZ });

export const dayKey = (iso) =>
  new Date(iso).toLocaleDateString("en-CA", { timeZone: CLINIC_TZ });

export const titleCase = (s = "") =>
  s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const endOf = (a) => new Date(a.end || a.start).getTime();
export const isPast = (a) => endOf(a) < Date.now();
export const isToday = (a) => dayKey(a.start) === dayKey(new Date().toISOString());

// One rule for both portals: upcoming | past | closed
export const bucket = (a) => {
  if (a.status === "rejected" || a.status === "cancelled") return "closed";
  return isPast(a) ? "past" : "upcoming";
};

// What the user should SEE (a confirmed visit in the past is "Completed")
export const displayStatus = (a) => {
  if (a.status === "confirmed" && isPast(a)) return "completed";
  if (a.status === "pending" && isPast(a)) return "expired";
  return a.status;
};

export const TABS = [
  ["upcoming", "Upcoming"],
  ["past", "Past"],
  ["closed", "Declined & cancelled"],
];

// ---------- styles ----------
const STATUS = {
  pending: { label: "Pending", badge: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500" },
  confirmed: { label: "Confirmed", badge: "bg-teal-50 text-teal-700 ring-teal-200", dot: "bg-teal-500" },
  completed: { label: "Completed", badge: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400" },
  expired: { label: "Expired", badge: "bg-slate-100 text-slate-500 ring-slate-200", dot: "bg-slate-400" },
  rejected: { label: "Declined", badge: "bg-red-50 text-red-700 ring-red-200", dot: "bg-red-500" },
  cancelled: { label: "Cancelled", badge: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400" },
};

// ---------- shared components ----------
export function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.cancelled;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${s.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function DateBlock({ iso, tone = "default" }) {
  const color = tone === "pending" ? "bg-amber-100 text-amber-900" : "bg-teal-50 text-teal-900";
  return (
    <div className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl ${color}`}>
      <span className="text-[11px] font-semibold uppercase tracking-wide">
        {fmt(iso, { month: "short" })}
      </span>
      <span className="text-2xl font-bold leading-none">{fmt(iso, { day: "numeric" })}</span>
    </div>
  );
}

export function FilterTabs({ tabs, value, onChange, counts }) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {tabs.map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            value === key
              ? "bg-teal-800 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {label} ({counts[key] ?? 0})
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ title, hint }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center">
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

// The one row used by BOTH patient and doctor lists.
//   name:     person to show (doctor for patient, patient for doctor)
//   children: replaces the status badge (e.g. Accept / Reject buttons)
export function AppointmentRow({ a, name, hint, tone = "default", footer, children }) {
  const showToday =
    isToday(a) && !isPast(a) && (a.status === "pending" || a.status === "confirmed");

  return (
    <li
      className={`flex flex-wrap items-center gap-4 rounded-2xl border p-4 transition hover:shadow-sm ${
        tone === "pending" ? "border-amber-200 bg-amber-50/40" : "border-slate-200 bg-white"
      }`}
    >
      <DateBlock iso={a.start} tone={tone} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium text-slate-900">{name}</p>
          {showToday && (
            <span className="rounded-full bg-teal-800 px-2 py-0.5 text-[10px] font-medium text-white">
              Today
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-slate-600">
          {fmt(a.start, { weekday: "long" })} &middot;{" "}
          {fmt(a.start, { hour: "numeric", minute: "2-digit" })}
        </p>
        {a.reason && <p className="mt-0.5 truncate text-xs text-slate-500">Reason: {a.reason}</p>}
        {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
      </div>

      <div className="flex items-center gap-2">
        {children ?? <StatusBadge status={displayStatus(a)} />}
      </div>

      {footer && <div className="basis-full">{footer}</div>}
    </li>
  );
}


export function computeStats(list) {
  const s = { pending: 0, today: 0, upcoming: 0, completed: 0 };
  for (const a of list) {
    const past = isPast(a);
    if (a.status === "pending" && !past) s.pending++;
    if (a.status === "confirmed") {
      if (past) s.completed++;
      else {
        s.upcoming++;
        if (isToday(a)) s.today++;
      }
    }
  }
  return s;
}

export function StatCards({ appointments }) {
  const s = computeStats(appointments);
  const items = [
    ["Pending", s.pending, "text-amber-600"],
    ["Today", s.today, "text-teal-700"],
    ["Upcoming", s.upcoming, "text-slate-900"],
    ["Completed", s.completed, "text-slate-900"],
  ];
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map(([label, value, tone]) => (
        <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className={`mt-1 text-3xl font-semibold ${tone}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}