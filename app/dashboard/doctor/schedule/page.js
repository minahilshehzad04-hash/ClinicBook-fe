"use client";

import DashboardError from "@/components/Dashboard/DashboardError";
import DashboardShell from "@/components/Dashboard/DashboardShell";
import WeeklySchedule from "@/components/Dashboard/WeeklySchedule";
import { PageLoader } from "@/components/Loader";
import { getDoctorSchedulePage } from "@/app/lib/api";
import { useDashboard } from "@/app/lib/useDashboard";

// /dashboard/doctor/schedule
export default function DoctorSchedulePage() {
  const { data, error, handleLogout, refetch } = useDashboard(getDoctorSchedulePage, "doctor");

  if (error) return <DashboardError error={error} onLogout={handleLogout} />;
  if (!data) return <PageLoader label="Loading your schedule..." />;

  return (
    <DashboardShell
      user={data.doctor}
      title="My schedule"
      subtitle="Set the hours you see patients each week. Days with no window are days off."
      onLogout={handleLogout}
    >
      <WeeklySchedule days={data.days} onChanged={refetch} />
    </DashboardShell>
  );
}