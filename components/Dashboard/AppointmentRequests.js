"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError, respondToAppointment } from "@/app/lib/api";
import { Spinner } from "@/components/Loader";
import SectionCard from "./SectionCard";
import {
  AppointmentRow,
  EmptyState,
  FilterTabs,
  StatCards,
  TABS,
  bucket,
  titleCase,
} from "./AppointmentUI";

function PendingRow({ a, onChanged }) {
  const [busy, setBusy] = useState(null); // "accept" | "reject" | null
  const [error, setError] = useState(null);

  async function decide(action) {
    setBusy(action);
    setError(null);
    try {
      await respondToAppointment(a.id, action);
      await onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <AppointmentRow
      a={a}
      name={titleCase(a.patient_name) || "Patient"}
      tone="pending"
      footer={error && <p className="text-xs text-red-600">{error}</p>}
    >
      <button
        type="button"
        onClick={() => decide("accept")}
        disabled={busy !== null}
        className="inline-flex items-center gap-2 rounded-lg bg-teal-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-teal-900 disabled:opacity-60"
      >
        {busy === "accept" && <Spinner size="h-4 w-4" />} Accept
      </button>
      <button
        type="button"
        onClick={() => decide("reject")}
        disabled={busy !== null}
        className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
      >
        {busy === "reject" && <Spinner size="h-4 w-4" />} Reject
      </button>
    </AppointmentRow>
  );
}

export default function AppointmentRequests({ appointments, onChanged }) {
  // Poll every 30s so new requests show up without a manual refresh.
  // The ref keeps the interval stable even if onChanged changes identity.
  const latest = useRef(onChanged);
  useEffect(() => {
    latest.current = onChanged;
  }, [onChanged]);
  useEffect(() => {
    const t = setInterval(() => latest.current?.(), 30000);
    return () => clearInterval(t);
  }, []);

  const [tab, setTab] = useState("upcoming");

  const asc = [...appointments].sort((x, y) => new Date(x.start) - new Date(y.start));
  const pending = asc.filter((a) => a.status === "pending");
  const others = asc.filter((a) => a.status !== "pending");

  const groups = {
    upcoming: others.filter((a) => bucket(a) === "upcoming"),
    past: others.filter((a) => bucket(a) === "past").reverse(),
    closed: others.filter((a) => bucket(a) === "closed").reverse(),
  };
  const counts = {
    upcoming: groups.upcoming.length,
    past: groups.past.length,
    closed: groups.closed.length,
  };
  const list = groups[tab];

  return (
    <div className="grid gap-6">
      <StatCards appointments={appointments} />

      <SectionCard title={`Pending requests (${pending.length})`}>
        {pending.length === 0 ? (
          <EmptyState
            title="You're all caught up"
            hint="New patient requests will appear here automatically."
          />
        ) : (
          <ul className="grid gap-3">
            {pending.map((a) => (
              <PendingRow key={a.id} a={a} onChanged={onChanged} />
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Appointments">
        <FilterTabs tabs={TABS} value={tab} onChange={setTab} counts={counts} />
        {list.length === 0 ? (
          <EmptyState
            title={`No ${tab === "closed" ? "declined or cancelled" : tab} appointments`}
          />
        ) : (
          <ul className="grid gap-3">
            {list.map((a) => (
              <AppointmentRow key={a.id} a={a} name={titleCase(a.patient_name) || "Patient"} />
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}