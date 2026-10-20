"use client";

import { useEffect, useState } from "react";
import { ApiError, bookAppointment, fieldError, getDoctorSlots } from "@/app/lib/api";
import { Spinner } from "@/components/Loader";
import { doctorName, specialityOf, qualificationOf, experienceOf, feeOf } from "./DoctorCard";

// Show every time in the clinic's timezone, whatever the patient's device says.
const CLINIC_TZ = "Asia/Karachi";
const DURATION = 30; // minutes, must match what the slots were generated with

// Local YYYY-MM-DD (toISOString would shift the date to UTC)
function toDateParam(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "DR";

const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", timeZone: CLINIC_TZ });

const parseDay = (isoDate) => new Date(`${isoDate}T00:00:00`);
const fmtLong = (isoDate) =>
  parseDay(isoDate).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
const fmtWeekday = (isoDate) => parseDay(isoDate).toLocaleDateString([], { weekday: "short" });
const fmtDayNum = (isoDate) => parseDay(isoDate).getDate();

function hourOf(iso) {
  return Number(
    new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: CLINIC_TZ })
      .formatToParts(new Date(iso))
      .find((p) => p.type === "hour").value
  );
}

function groupSlots(slots) {
  const groups = [
    { label: "Morning", items: [] },
    { label: "Afternoon", items: [] },
    { label: "Evening", items: [] },
  ];
  for (const s of slots) {
    const h = hourOf(s.start);
    groups[h < 12 ? 0 : h < 17 ? 1 : 2].items.push(s);
  }
  return groups.filter((g) => g.items.length);
}

// Slots + booking for ONE doctor. The parent picks the doctor.
// Use key={doctor.id} in the parent so state resets when the doctor changes.
export default function AvailableSlots({ doctor, onBooked, onClose }) {
  const doctorId = doctor.id;
  const name = `Dr. ${doctorName(doctor)}`;
  const spec = specialityOf(doctor);

  const [weekOffset, setWeekOffset] = useState(0);
  const [days, setDays] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // booking
  const [reason, setReason] = useState("");
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState(null);
  const [bookSuccess, setBookSuccess] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const start = new Date();
        start.setDate(start.getDate() + weekOffset * 7);
        const res = await getDoctorSlots(doctorId, {
          start: toDateParam(start),
          days: 7,
          duration: DURATION,
        });
        if (cancelled) return;
        setDays(res.days);
        setSelectedSlot(null);
        // Keep the current day if it still has slots, else jump to the first day with slots
        setSelectedDate((prev) =>
          res.days.find((d) => d.date === prev && d.slots.length)
            ? prev
            : res.days.find((d) => d.slots.length)?.date ?? null
        );
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err : new ApiError("Could not load slots."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [doctorId, weekOffset, reloadKey]);

  async function handleContinue() {
    if (!selectedSlot) return;
    setBooking(true);
    setBookError(null);
    setBookSuccess("");
    try {
      await bookAppointment({
        doctor: doctorId,
        start: selectedSlot.start, // ISO string from the API, unchanged
        duration: DURATION,
        reason: reason.trim(),
      });
      setBookSuccess("Request sent. Waiting for the doctor to confirm.");
      setReason("");
      setSelectedSlot(null);
      setReloadKey((k) => k + 1); // refresh slots so the taken one disappears
      await onBooked?.(); // refresh "My appointments"
    } catch (err) {
      setBookError(err instanceof ApiError ? err : new ApiError("Could not book this slot."));
      setReloadKey((k) => k + 1); // the slot may have just been taken
    } finally {
      setBooking(false);
    }
  }

  const activeDay = days?.find((d) => d.date === selectedDate) || null;
  const weekHasSlots = days?.some((d) => d.slots.length);
  const bookMessage =
    fieldError(bookError, "start") ||
    fieldError(bookError, "doctor") ||
    bookError?.message ||
    null;

  return (
    <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Selected doctor header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-800 text-sm font-semibold text-white">
            {initials(doctorName(doctor))}
          </span>
          <div>
            <p className="font-semibold text-slate-900">Book with {name}</p>
            <p className="text-xs text-slate-500">
              {spec ? <span className="capitalize">{spec} &middot; </span> : null}
              Times shown in clinic time
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-9 rounded-lg border border-slate-300 px-4 text-sm hover:bg-slate-50"
        >
          Close
        </button>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-700">Pick a day</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
            disabled={weekOffset === 0 || loading}
            className="h-9 rounded-lg border border-slate-300 px-3 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w + 1)}
            disabled={loading}
            className="h-9 rounded-lg border border-slate-300 px-3 text-sm disabled:opacity-50"
          >
            Next week
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner size="h-4 w-4" /> Loading slots...
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      {!loading && !error && days && (
        <>
          {/* Day strip */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((d) => {
              const has = d.slots.length > 0;
              const active = d.date === selectedDate;
              return (
                <button
                  key={d.date}
                  type="button"
                  disabled={!has}
                  onClick={() => {
                    setSelectedDate(d.date);
                    setSelectedSlot(null);
                  }}
                  className={[
                    "flex flex-col items-center rounded-xl border px-1 py-3 text-center transition",
                    active
                      ? "border-teal-800 bg-teal-800 text-white"
                      : has
                      ? "border-slate-200 bg-white hover:border-teal-600"
                      : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300",
                  ].join(" ")}
                >
                  <span className="text-xs">{fmtWeekday(d.date)}</span>
                  <span className="text-lg font-semibold">{fmtDayNum(d.date)}</span>
                  <span className="text-[10px]">{has ? `${d.slots.length} slots` : "Off"}</span>
                </button>
              );
            })}
          </div>

          {/* Slots for the selected day */}
          {!weekHasSlots ? (
            <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              {name} has no open slots this week. Try the next week.
            </p>
          ) : activeDay ? (
            <div className="rounded-2xl border border-slate-200 p-5">
              <h3 className="mb-4 font-medium text-slate-900">{fmtLong(activeDay.date)}</h3>
              <div className="space-y-4">
                {groupSlots(activeDay.slots).map((g) => (
                  <div key={g.label}>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                      {g.label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {g.items.map((s) => {
                        const active = selectedSlot?.start === s.start;
                        return (
                          <button
                            key={s.start}
                            type="button"
                            onClick={() => setSelectedSlot(s)}
                            className={[
                              "rounded-full px-4 py-1.5 text-sm font-medium transition",
                              active
                                ? "bg-teal-800 text-white"
                                : "bg-teal-50 text-teal-900 hover:bg-teal-100",
                            ].join(" ")}
                          >
                            {fmtTime(s.start)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Selection summary + booking */}
          {selectedSlot && (
            <div className="space-y-3 rounded-2xl bg-teal-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-teal-900">
                  <span className="font-medium">{name}</span> &middot; {fmtLong(selectedDate)} at{" "}
                  <span className="font-medium">{fmtTime(selectedSlot.start)}</span>
                </p>
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={booking}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-teal-800 px-5 text-sm font-medium text-white disabled:opacity-60"
                >
                  {booking && <Spinner size="h-4 w-4" />}
                  {booking ? "Sending..." : "Continue"}
                </button>
              </div>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={300}
                placeholder="Reason for visit (optional)"
                className="h-10 w-full rounded-lg border border-teal-200 bg-white px-3 text-sm"
              />
            </div>
          )}
        </>
      )}

      {bookSuccess && <p className="text-sm text-teal-800">{bookSuccess}</p>}
      {bookMessage && <p className="text-sm text-red-600">{bookMessage}</p>}
    </div>
  );
}