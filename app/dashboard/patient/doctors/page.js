"use client";

import DoctorFinder from "@/components/Dashboard/DoctorFinder";
import DashboardError from "@/components/Dashboard/DashboardError";
import DashboardShell from "@/components/Dashboard/DashboardShell";
import { PageLoader } from "@/components/Loader";
import { getPatientAppointmentsPage } from "@/app/lib/api";
import { useDashboard } from "@/app/lib/useDashboard";

// /dashboard/patient/doctors
export default function PatientDoctorsPage() {
  const { data, error, handleLogout, refetch } = useDashboard(
    getPatientAppointmentsPage,
    "patient"
  );

  if (error) return <DashboardError error={error} onLogout={handleLogout} />;
  if (!data) return <PageLoader label="Loading doctors..." />;

  return (
    <DashboardShell
      user={data.patient}
      title="Doctors"
      subtitle="Browse doctor profiles and book an available slot."
      onLogout={handleLogout}
    >
      <DoctorFinder doctors={data.doctors} onBooked={refetch} />
    </DashboardShell>
  );
}