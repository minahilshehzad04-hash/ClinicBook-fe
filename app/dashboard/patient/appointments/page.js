"use client";

import Link from "next/link";
import MyAppointments from "@/components/Dashboard/MyAppointments";
import DashboardError from "@/components/Dashboard/DashboardError";
import DashboardShell from "@/components/Dashboard/DashboardShell";
import { PageLoader } from "@/components/Loader";
import { getPatientAppointmentsPage } from "@/app/lib/api";
import { useDashboard } from "@/app/lib/useDashboard";

// /dashboard/patient/appointments
export default function PatientAppointmentsPage() {
  const { data, error, handleLogout } = useDashboard(
    getPatientAppointmentsPage,
    "patient"
  );

  if (error) return <DashboardError error={error} onLogout={handleLogout} />;
  if (!data) return <PageLoader label="Loading appointments..." />;

  return (
    <DashboardShell
      user={data.patient}
      title="Appointments"
      subtitle="Your upcoming and past visits."
      onLogout={handleLogout}
    >
      <div className="flex justify-end">
        <Link
        href="/dashboard/patient/doctors"
        style={{ color: "#fff" }}
        className="rounded-xl bg-teal-800 px-5 py-2.5 text-sm font-medium shadow-sm transition hover:bg-teal-900"
        >
        Book new appointment
        </Link>
      </div>
      <MyAppointments appointments={data.appointments} />
    </DashboardShell>
  );
}