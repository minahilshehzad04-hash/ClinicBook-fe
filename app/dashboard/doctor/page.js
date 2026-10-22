"use client";

import Link from "next/link";
import DashboardError from "@/components/Dashboard/DashboardError";
import DashboardShell from "@/components/Dashboard/DashboardShell";
import { PageLoader } from "@/components/Loader";
import ProfileSummary from "@/components/Dashboard/ProfileSummary";
import SectionCard from "@/components/Dashboard/SectionCard";
import StatCard from "@/components/Dashboard/StatCard";
import { AppointmentRow, isToday, titleCase } from "@/components/Dashboard/AppointmentUI";
import { getDoctorDashboardPage } from "@/app/lib/api";
import { useDashboard } from "@/app/lib/useDashboard";

// /dashboard/doctor
export default function DoctorDashboardPage() {
  const { data, error, handleLogout } = useDashboard(getDoctorDashboardPage, "doctor");

  if (error) return <DashboardError error={error} onLogout={handleLogout} />;
  if (!data) return <PageLoader label="Loading your dashboard..." />;

  const doctor = data.doctor;
  const profile = data.profile;
  const appointments = data.appointments ?? [];
  const todayAppointments = appointments
    .filter((appointment) =>
      isToday(appointment.start) && !["rejected", "cancelled"].includes(appointment.status)
    )
    .sort((a, b) => new Date(a.start) - new Date(b.start));
  const patients = [...appointments]
    .sort((a, b) => new Date(b.start) - new Date(a.start))
    .filter((appointment, index, sorted) =>
      sorted.findIndex((candidate) =>
        appointment.patient_id != null && candidate.patient_id != null
          ? candidate.patient_id === appointment.patient_id
          : candidate.patient_name === appointment.patient_name
      ) === index
    );
  const pendingRequests = appointments.filter((appointment) => appointment.status === "pending");

  return (
    <DashboardShell
      user={doctor}
      title={data.message}
      subtitle="Here is your day at a glance."
      onLogout={handleLogout}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Today's appointments" value={todayAppointments.length} />
        <StatCard label="Total patients" value={patients.length} />
        <StatCard label="Pending requests" value={pendingRequests.length} />
      </div>

      <SectionCard
        title="Today's appointments"
        action={
          <Link href="/dashboard/doctor/appointments" className="text-sm font-medium text-teal-800 hover:text-teal-950">
            View all
          </Link>
        }
        emptyText="No appointments today."
      >
        {todayAppointments.length > 0 && (
          <ul className="grid gap-3">
            {todayAppointments.map((appointment) => (
              <AppointmentRow
                key={appointment.id}
                a={appointment}
                name={appointment.patient_name || "Patient"}
                hint={appointment.status === "pending" ? "Appointment request" : "Scheduled for today"}
              />
            ))}
          </ul>
        )}
      </SectionCard>
      <SectionCard
        title="Patients"
        action={
          <Link href="/dashboard/doctor/appointments" className="text-sm font-medium text-teal-800 hover:text-teal-950">
            View appointments
          </Link>
        }
        emptyText="Your patients will appear here."
      >
        {patients.length > 0 && (
          <ul className="grid gap-3">
            {patients.slice(0, 5).map((appointment) => (
              <AppointmentRow
                key={appointment.patient_id ?? appointment.patient_name}
                a={appointment}
                name={titleCase(appointment.patient_name || "Patient")}
                hint="Most recent appointment"
              />
            ))}
          </ul>
        )}
      </SectionCard>

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
