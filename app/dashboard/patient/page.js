"use client";

import Link from "next/link";
import DashboardError from "@/components/Dashboard/DashboardError";
import DashboardShell from "@/components/Dashboard/DashboardShell";
import { PageLoader } from "@/components/Loader";
import ProfileSummary from "@/components/Dashboard/ProfileSummary";
import SectionCard from "@/components/Dashboard/SectionCard";
import StatCard from "@/components/Dashboard/StatCard";
import { AppointmentRow, bucket, isPast, titleCase } from "@/components/Dashboard/AppointmentUI";
import { getPatientDashboardPage } from "@/app/lib/api";
import { useDashboard } from "@/app/lib/useDashboard";

export default function PatientDashboardPage() {
  const { data, error, handleLogout } = useDashboard(getPatientDashboardPage, "patient");

  if (error) return <DashboardError error={error} onLogout={handleLogout} />;
  if (!data) return <PageLoader label="Loading your dashboard..." />;

  const patient = data.patient;
  const appointments = data.appointments ?? [];
  const upcoming = appointments
    .filter((appointment) => bucket(appointment) === "upcoming")
    .sort((a, b) => new Date(a.start) - new Date(b.start));
  const pastVisits = appointments
    .filter((appointment) => appointment.status === "confirmed" && isPast(appointment))
    .sort((a, b) => new Date(b.start) - new Date(a.start));

  return (
    <DashboardShell
      user={patient}
      title={data.message}
      subtitle="Here is what is happening with your care."
      onLogout={handleLogout}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Upcoming appointments" value={upcoming.length} />
        <StatCard label="Past visits" value={pastVisits.length} />
        <StatCard label="Prescriptions" value="—" hint="Prescription records are not available yet" />
      </div>

      <SectionCard
        title="Upcoming appointments"
        action={
          <Link href="/dashboard/patient/appointments" className="text-sm font-medium text-teal-800 hover:text-teal-950">
            View all
          </Link>
        }
        emptyText="You have no upcoming appointments."
      >
        {upcoming.length > 0 && (
          <ul className="grid gap-3">
            {upcoming.slice(0, 3).map((appointment) => (
              <AppointmentRow
                key={appointment.id}
                a={appointment}
                name={`Dr. ${titleCase(appointment.doctor_name)}`}
                hint={appointment.status === "pending" ? "Waiting for the doctor to confirm" : "See you there"}
              />
            ))}
          </ul>
        )}
      </SectionCard>
      <SectionCard
        title="Past visits"
        action={
          <Link href="/dashboard/patient/appointments" className="text-sm font-medium text-teal-800 hover:text-teal-950">
            View all
          </Link>
        }
        emptyText="Your past visits will appear here."
      >
        {pastVisits.length > 0 && (
          <ul className="grid gap-3">
            {pastVisits.slice(0, 3).map((appointment) => (
              <AppointmentRow
                key={appointment.id}
                a={appointment}
                name={`Dr. ${titleCase(appointment.doctor_name)}`}
              />
            ))}
          </ul>
        )}
      </SectionCard>
      <ProfileSummary user={patient} profileHref="/dashboard/patient/profile" />
    </DashboardShell>
  );
}
