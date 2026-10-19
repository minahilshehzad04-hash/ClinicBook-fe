"use client";

import Link from "next/link";
import DashboardError from "@/components/Dashboard/DashboardError";
import DashboardShell from "@/components/Dashboard/DashboardShell";
import { PageLoader } from "@/components/Loader";
import ProfileSummary from "@/components/Dashboard/ProfileSummary";
import SectionCard from "@/components/Dashboard/SectionCard";
import StatCard from "@/components/Dashboard/StatCard";
import { getDoctorDashboard } from "@/app/lib/api";
import { useDashboard } from "@/app/lib/useDashboard";

// /dashboard/doctor
export default function DoctorDashboardPage() {
  const { data, error, handleLogout } = useDashboard(getDoctorDashboard, "doctor");

  if (error) return <DashboardError error={error} onLogout={handleLogout} />;
  if (!data) return <PageLoader label="Loading your dashboard..." />;

  const doctor = data.doctor;
  const profile = data.profile;

  return (
    <DashboardShell
      user={doctor}
      title={data.message}
      subtitle="Here is your day at a glance."
      onLogout={handleLogout}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Today's appointments" value={0} />
        <StatCard label="Total patients" value={0} />
        <StatCard label="Pending requests" value={0} />
      </div>

      <SectionCard title="Today's appointments" emptyText="No appointments today." />
      <SectionCard title="Patients" emptyText="Your patients will appear here." />

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Professional details</h3>
          <Link
            href="/dashboard/doctor/profile?edit=1"
            className="text-sm font-medium text-teal-800"
          >
            {profile?.specialty ? "Edit" : "Complete your details"}
          </Link>
        </div>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-slate-500">Specialty</dt>
            <dd className="text-sm font-medium text-slate-900">{profile?.specialty || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Experience</dt>
            <dd className="text-sm font-medium text-slate-900">
              {profile?.years_of_experience != null
                ? `${profile.years_of_experience} years`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Consultation fee</dt>
            <dd className="text-sm font-medium text-slate-900">
              {profile?.consultation_fee != null ? `Rs ${profile.consultation_fee}` : "-"}
            </dd>
          </div>
        </dl>
      </section>

      <ProfileSummary user={doctor} profileHref="/dashboard/doctor/profile" />
    </DashboardShell>
  );
}