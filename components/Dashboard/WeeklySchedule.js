"use client";

import { useState } from "react";
import { ApiError, addScheduleWindow, deleteScheduleWindow, fieldError } from "@/app/lib/api";
import Field from "@/components/Field";
import { Spinner } from "@/components/Loader";
import SectionCard from "./SectionCard";

const formatTime = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes).padStart(2, "0")} ${period}`;
};

function DayCard({ day, onChanged }) {
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("13:00");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await addScheduleWindow({ weekday: day.weekday, start_time: start, end_time: end });
      await onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError("Something went wrong."));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this time slot?")) return;
    setError(null);
    try {
      await deleteScheduleWindow(id);
      await onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError("Could not remove it."));
    }
  }

  const generalError = error && !error.details ? error.message : null;

  return (
    <SectionCard
      title={day.name}
      action={
        <span className="text-xs text-slate-500">
          {day.slots.length
            ? `${day.slots.length} time slot${day.slots.length === 1 ? "" : "s"}`
            : "Day off"}
        </span>
      }
      emptyText="Day off. Add a time slot below."
    >
      {day.slots.length > 0 && (
        <ul className="mb-4 flex flex-wrap gap-2">
          {day.slots.map((s) => (
            <li
              key={s.id}
              className="flex min-h-14 items-center gap-3 rounded-full bg-teal-50 px-5 py-2 text-lg font-semibold text-teal-950"
            >
              <span>{formatTime(s.start_time)} – {formatTime(s.end_time)}</span>
              <button
                type="button"
                onClick={() => handleDelete(s.id)}
                aria-label={`Remove ${formatTime(s.start_time)} to ${formatTime(s.end_time)}`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-teal-800 transition hover:bg-red-100 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
        <Field
          label="Start time" type="time" showLabel required
          value={start} onChange={(e) => setStart(e.target.value)}
        />
        <Field
          label="End time" type="time" showLabel required
          value={end} onChange={(e) => setEnd(e.target.value)}
          error={fieldError(error, "end_time") || fieldError(error, "start_time")}
        />
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-12 items-center justify-center gap-2 self-end rounded-lg bg-teal-800 px-4 text-sm font-semibold text-white transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy && <Spinner size="h-4 w-4" />}
          {busy ? "Adding..." : "Add time slot"}
        </button>
      </form>

      {generalError && <p className="mt-2 text-xs text-red-600">{generalError}</p>}
    </SectionCard>
  );
}

export default function WeeklySchedule({ days, onChanged }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {[...days].sort((a, b) => a.weekday - b.weekday).map((day) => (
        <DayCard key={day.weekday} day={day} onChanged={onChanged} />
      ))}
    </div>
  );
}