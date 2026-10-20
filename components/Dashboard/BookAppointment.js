"use client";

import { useState } from "react";
import { ApiError, bookAppointment, fieldError, getDoctorSlots } from "@/app/lib/api";
import { Spinner } from "@/components/Loader";
import SectionCard from "./SectionCard";

const DURATION = 30; // must match the duration used to fetch the slots
const timeLabel = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function BookAppointment({ doctors, onBooked }) {
  const [doctorId, setDoctorId] = useState(null);
  const [days, setDays] = useState([]);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [busySlot, setBusySlot] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  async function loadSlots(id) {
    setLoading(true);
    try {
      const res = await getDoctorSlots(id, 7, DURATION);
      setDays(res.days);
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError("Could not load slots."));
    } finally {
      setLoading(false);
    }
  }

  function pickDoctor(id) {
    setDoctorId(id);
    setError(null);
    setSuccess("");
    loadSlots(id);
  }

  async function handleBook(slot) {
    setBusySlot(slot.start);
    setError(null);
    setSuccess("");
    try {
      await bookAppointment({
        doctor: doctorId,
        start: slot.start, // send back unchanged (includes timezone)
        duration: DURATION,
        reason,
      });
      setSuccess("Request sent. Waiting for the doctor to confirm.");
      setReason("");
      await Promise.all([loadSlots(doctorId), onBooked?.()]);
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError("Could not book this slot."));
      loadSlots(doctorId); // slot may have just been taken
    } finally {
      setBusySlot(null);
    }
  }

  const slotError = fieldError(error, "start");
  const generalError = error && !error.details ? error.message : null;

  return (
    <SectionCard title="Book an appointment">
      <p className="mb-2 text-sm font-medium text-slate-700">1. Choose a doctor</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {doctors.length === 0 && (
          <p className="text-sm text-slate-500">No doctors have published availability yet.</p>
        )}
        {doctors.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => pickDoctor(d.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              d.id === doctorId
                ? "bg-teal-800 text-white"
                : "bg-teal-50 text-teal-900 hover:bg-teal-100"
            }`}
          >
            {d.name}
          </button>
        ))}
      </div>

      {doctorId && (
        <>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            2. Reason for visit (optional)
          </label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Fever and cough"
            className="mb-4 h-12 w-full rounded-lg border border-slate-300 px-3 text-sm"
          />

          <p className="mb-2 text-sm font-medium text-slate-700">3. Pick a time</p>
          {loading ? (
            <Spinner size="h-5 w-5" />
          ) : (
            <div className="grid gap-3">
              {days.map((day) => (
                <div key={day.date}>
                  <p className="mb-1 text-xs font-semibold uppercase text-slate-500">
                    {day.weekday_name}, {day.date}
                  </p>
                  {day.slots.length === 0 ? (
                    <p className="text-xs text-slate-400">No free slots</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {day.slots.map((s) => (
                        <button
                          key={s.start}
                          type="button"
                          disabled={busySlot !== null}
                          onClick={() => handleBook(s)}
                          className="rounded-lg border border-teal-700 px-3 py-1 text-sm text-teal-900 hover:bg-teal-50 disabled:opacity-50"
                        >
                          {busySlot === s.start ? "Sending..." : timeLabel(s.start)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {success && <p className="mt-3 text-sm text-teal-800">{success}</p>}
      {slotError && <p className="mt-3 text-sm text-red-600">{slotError}</p>}
      {generalError && <p className="mt-3 text-sm text-red-600">{generalError}</p>}
    </SectionCard>
  );
}