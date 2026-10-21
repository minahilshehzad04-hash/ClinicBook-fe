"use client";

import { useState } from "react";
import { ApiError, addScheduleWindow, deleteScheduleWindow, fieldError } from "@/app/lib/api";
import Field from "@/components/Field";
import { Spinner } from "@/components/Loader";
import SectionCard from "./SectionCard";

const hhmm = (t) => t.slice(0, 5);

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
    if (!window.confirm("Remove this time window?")) return;
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
          {day.slots.length ? `${day.slots.length} window(s)` : "Day off"}
        </span>
      }
      emptyText="Day off. Add a window below."
    >
      {day.slots.length > 0 && (
        <ul className="mb-4 flex flex-wrap gap-2">
          {day.slots.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-900"
            >
              {hhmm(s.start_time)} - {hhmm(s.end_time)}
              <button
                type="button"
                onClick={() => handleDelete(s.id)}
                aria-label={`Remove ${hhmm(s.start_time)} to ${hhmm(s.end_time)}`}
                className="text-teal-700 hover:text-red-600"
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
          className="inline-flex h-12 items-center justify-center gap-2 self-end rounded-lg bg-teal-800 px-5 text-sm font-medium text-white disabled:opacity-60"
        >
          {busy && <Spinner size="h-4 w-4" />}
          {busy ? "Adding" : "Add"}
        </button>
      </form>

      {generalError && <p className="mt-2 text-xs text-red-600">{generalError}</p>}
    </SectionCard>
  );
}

export default function WeeklySchedule({ days, onChanged }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {days.map((day) => (
        <DayCard key={day.weekday} day={day} onChanged={onChanged} />
      ))}
    </div>
  );
}