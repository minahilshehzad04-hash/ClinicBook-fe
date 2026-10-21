"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AvailableSlots from "./AvailableSlots";
import DoctorCard, { doctorName, specialityOf } from "./DoctorCard";

export default function DoctorFinder({ doctors, onBooked }) {
  const [query, setQuery] = useState("");
  const [spec, setSpec] = useState("all");
  const [selectedId, setSelectedId] = useState(null);

  const specialities = useMemo(() => {
    const counts = {};
    doctors.forEach((d) => {
      const s = specialityOf(d);
      if (s) counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b));
  }, [doctors]);

  const filtered = doctors.filter((d) => {
    const q = query.trim().toLowerCase();
    const matchesName =
      !q || doctorName(d).toLowerCase().includes(q) || specialityOf(d).toLowerCase().includes(q);
    const matchesSpec = spec === "all" || specialityOf(d) === spec;
    return matchesName && matchesSpec;
  });

  const selected = doctors.find((d) => d.id === selectedId);
  const close = () => setSelectedId(null);

  // Popup open hone par: Esc se band, aur peeche ki page scroll lock
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e) => e.key === "Escape" && setSelectedId(null);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [selectedId]);

  const filtersOn = query || spec !== "all";

  return (
    <div className="grid gap-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Find a doctor</h2>
            <p className="text-xs text-slate-500">
              {filtered.length} of {doctors.length} doctors
            </p>
          </div>
          {filtersOn && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSpec("all");
              }}
              className="text-xs font-medium text-teal-700 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by doctor name or speciality..."
          className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100"
        />

        {specialities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {[["all", doctors.length], ...specialities].map(([s, n]) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpec(s)}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                  spec === s
                    ? "bg-teal-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s === "all" ? "All specialities" : s} ({n})
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">No doctors found</p>
          <p className="mt-1 text-xs text-slate-500">Try a different name or speciality.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((d) => (
            <DoctorCard
              key={d.id}
              doctor={d}
              onSelect={(doc) => setSelectedId(doc.id)}
            />
          ))}
        </div>
      )}

      <p className="text-center text-xs text-slate-500">
        Sent a request?{" "}
        <Link
          href="/dashboard/patient/appointments"
          className="font-medium text-teal-700 hover:underline"
        >
          View my appointments
        </Link>
      </p>

      {/* Slots popup */}
      {selected && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <AvailableSlots
              key={selected.id}
              doctor={selected}
              onBooked={onBooked}
              onClose={close}
            />
          </div>
        </div>
      )}
    </div>
  );
}