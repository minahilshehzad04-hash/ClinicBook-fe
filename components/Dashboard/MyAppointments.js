"use client";

import { useState } from "react";
import SectionCard from "./SectionCard";
import { AppointmentRow, EmptyState, FilterTabs, StatCards, TABS, bucket, isPast, titleCase } from "./AppointmentUI";

const hintFor = (a) => {
  if (isPast(a)) return "";
  if (a.status === "pending") return "Waiting for the doctor to confirm";
  if (a.status === "confirmed") return "See you there";
  if (a.status === "rejected") return "The doctor could not take this slot";
  return "";
};

export default function MyAppointments({ appointments, compact = false }) {
  const [tab, setTab] = useState("upcoming");

  const asc = [...appointments].sort((x, y) => new Date(x.start) - new Date(y.start));
  const groups = {
    upcoming: asc.filter((a) => bucket(a) === "upcoming"),
    past: asc.filter((a) => bucket(a) === "past").reverse(),
    closed: asc.filter((a) => bucket(a) === "closed").reverse(),
  };
  const counts = {
    upcoming: groups.upcoming.length,
    past: groups.past.length,
    closed: groups.closed.length,
  };
  const list = groups[tab];

   return (
  <div className={`grid ${compact ? "gap-4" : "gap-6"}`}>
    <StatCards appointments={appointments} />

    <SectionCard title="My appointments">
      <FilterTabs tabs={TABS} value={tab} onChange={setTab} counts={counts} />

      {list.length === 0 ? (
        <EmptyState
          title={`No ${tab === "closed" ? "declined or cancelled" : tab} appointments`}
          hint={tab === "upcoming" ? "Open the Doctors page to book one." : undefined}
        />
      ) : (
        <ul className="grid gap-3">
          {list.map((a) => (
            <AppointmentRow
              key={a.id}
              a={a}
              name={`Dr. ${titleCase(a.doctor_name)}`}
              hint={hintFor(a)}
            />
          ))}
        </ul>
      )}
    </SectionCard>
  </div>
);
}