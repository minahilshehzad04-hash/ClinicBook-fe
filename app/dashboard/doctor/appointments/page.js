"use client";

import AppointmentRequests from "@/components/Dashboard/AppointmentRequests";
import DashboardError from "@/components/Dashboard/DashboardError";
import DashboardShell from "@/components/Dashboard/DashboardShell";
import { PageLoader } from "@/components/Loader";
import { getDoctorAppointmentsPage } from "@/app/lib/api";
import { useDashboard } from "@/app/lib/useDashboard";

// /dashboard/doctor/appointments
export default function DoctorAppointmentsPage() {
  const { data, error, handleLogout, refetch } = useDashboard(
    getDoctorAppointmentsPage,
    "doctor"
  );

  if (error) return <DashboardError error={error} onLogout={handleLogout} />;
  if (!data) return <PageLoader label="Loading requests..." />;

  return (
    <DashboardShell
      user={data.doctor}
      title="Appointment requests"
      subtitle="Accept or reject requests from patients."
      onLogout={handleLogout}
    >
      <AppointmentRequests appointments={data.appointments} onChanged={refetch} />
    </DashboardShell>
  );
}