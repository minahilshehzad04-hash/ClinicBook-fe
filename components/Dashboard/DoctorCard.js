"use client";

import { titleCase } from "./AppointmentUI";

// Look for a value under several possible names, also inside a nested profile object.
const get = (d, keys) => {
  for (const src of [d, d?.profile, d?.doctor_profile]) {
    for (const k of keys) {
      const v = src?.[k];
      if (v !== undefined && v !== null && v !== "") return v;
    }
  }
  return "";
};

export const doctorName = (d) =>
  titleCase(
    String(get(d, ["full_name", "name"]) || `${d.first_name ?? ""} ${d.last_name ?? ""}`).trim()
  ).replace(/^Dr\.?\s+/i, "");

export const specialityOf = (d) => get(d, ["specialty", "speciality", "specialization"]);
export const qualificationOf = (d) => get(d, ["qualification", "qualifications", "degree"]);

const yearsOf = (d) => get(d, ["years_of_experience", "experience", "experience_years"]);

export const experienceOf = (d) => {
  const v = yearsOf(d);
  if (v === "") return "";
  return /^\d+(\.\d+)?$/.test(String(v)) ? `${v} ${Number(v) === 1 ? "year" : "years"}` : String(v);
};

export const feeOf = (d) => {
  const v = get(d, ["consultation_fee", "fee", "fees"]);
  if (v === "") return "";
  return /^\d+(\.\d+)?$/.test(String(v)) ? `Rs. ${Number(v).toLocaleString()}` : String(v);
};

const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "DR";

function Fact({ label, value }) {
  return (
    <div className="min-w-0 flex-1 px-2 text-center">
      <p className="truncate text-sm font-semibold text-slate-800">{value || "-"}</p>
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}

export default function DoctorCard({ doctor, selected = false, onSelect }) {
  const name = doctorName(doctor);
  const spec = specialityOf(doctor);
  const photo = get(doctor, ["photo", "profile_picture", "avatar"]);
  const bio = get(doctor, ["bio", "about"]);
  const fee = feeOf(doctor);

  // Experience ko chhota dikhane ke liye "2 years" -> "2 yrs"
  const exp = experienceOf(doctor).replace("years", "yrs").replace("year", "yr");

  return (
    <div
      className={`group flex w-full max-w-[300px] flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg ${
        selected ? "border-teal-600 ring-2 ring-teal-100" : "border-slate-200"
      }`}
    >
      {/* Banner */}
     <div className="relative h-14 overflow-hidden bg-gradient-to-r from-teal-800 via-teal-700 to-teal-500">
        <div className="absolute -right-4 -top-6 h-20 w-20 rounded-full bg-white/10" />
        <div className="absolute right-10 top-6 h-10 w-10 rounded-full bg-white/10" />
      </div>

      {/* Avatar */}
    <div className="relative z-10 -mt-8 flex justify-center">
    {photo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo}
      alt={name}
      className="h-16 w-16 rounded-full border-4 border-white bg-white object-cover shadow"
    />
    ) : (
    <span className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-teal-50 text-lg font-bold text-teal-800 shadow">
      {initials(name)}
    </span>
    )}
    </div>

      {/* Body */}
      <div className="flex flex-1 flex-col items-center px-4 pb-4 pt-2 text-center">
        <p className="w-full truncate text-base font-semibold text-slate-900">Dr. {name}</p>

        {spec ? (
          <span className="mt-1.5 rounded-full bg-teal-50 px-3 py-0.5 text-xs font-medium capitalize text-teal-800 ring-1 ring-inset ring-teal-200">
            {spec}
          </span>
        ) : (
          <span className="mt-1.5 text-xs text-slate-400">Speciality not listed</span>
        )}

        <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-xs leading-5 text-slate-500">
          {bio || "No bio added yet."}
        </p>

        {/* Facts */}
        <div className="mt-3 flex w-full divide-x divide-slate-200 rounded-xl bg-slate-50 py-2.5">
          <Fact label="Degree" value={qualificationOf(doctor)} />
          <Fact label="Experience" value={exp} />
        </div>

        {/* Fee + button */}
        <div className="mt-4 flex w-full items-center justify-between gap-3">
          <div className="text-left">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Consultation
            </p>
            <p className="text-sm font-semibold text-slate-900">{fee || "-"}</p>
          </div>
          <button
            type="button"
            onClick={() => onSelect(doctor)}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
              selected
                ? "bg-teal-900 text-white"
                : "bg-teal-800 text-white hover:bg-teal-900"
            }`}
          >
            View slots
          </button>
        </div>
      </div>
    </div>
  );
}