"use client";

import DashboardError from "@/components/Dashboard/DashboardError";
import DashboardShell from "@/components/Dashboard/DashboardShell";
import { PageLoader } from "@/components/Loader";
import ProfileSummary from "@/components/Dashboard/ProfileSummary";
import SectionCard from "@/components/Dashboard/SectionCard";
import StatCard from "@/components/Dashboard/StatCard";
import { getPatientDashboard } from "@/app/lib/api";
import { useDashboard } from "@/app/lib/useDashboard";

export default function PatientDashboardPage() {
  const { data, error, handleLogout } = useDashboard(getPatientDashboard, "patient");

  if (error) return <DashboardError error={error} onLogout={handleLogout} />;
  if (!data) return <PageLoader label="Loading your dashboard..." />;

  const patient = data.patient;

  return (
    <DashboardShell
      user={patient}
      title={data.message}
      subtitle="Here is what is happening with your care."
      onLogout={handleLogout}
    >
      {/* Replace the 0s with real counts once your API returns them */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Upcoming appointments" value={0} />
        <StatCard label="Past visits" value={0} />
        <StatCard label="Prescriptions" value={0} />
      </div>

      <SectionCard
        title="Upcoming appointments"
        emptyText="You have no upcoming appointments."
      />
      <SectionCard
        title="Past visits"
        emptyText="Your past visits will appear here."
      />
      <ProfileSummary user={patient} profileHref="/dashboard/patient/profile" />
    </DashboardShell>
  );
}