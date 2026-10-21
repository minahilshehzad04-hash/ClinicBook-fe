"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import DashboardError from "@/components/Dashboard/DashboardError";
import DashboardShell from "@/components/Dashboard/DashboardShell";
import EditProfileForm from "@/components/Dashboard/EditProfileForm";
import { PageLoader } from "@/components/Loader";
import ProfileCard from "@/components/Dashboard/ProfileCard";
import { getDoctorDashboard, updateDoctorProfile } from "@/app/lib/api";
import { useDashboard } from "@/app/lib/useDashboard";

function DoctorProfileContent() {
  const { data, error, handleLogout, refetch } = useDashboard(getDoctorDashboard, "doctor");
  const [editing, setEditing] = useState(false);
  const wantsEdit = useSearchParams().get("edit") === "1";

  useEffect(() => {
    if (wantsEdit) setEditing(true);
  }, [wantsEdit]);

  if (error) return <DashboardError error={error} onLogout={handleLogout} />;
  if (!data) return <PageLoader label="Loading your profile..." />;

  return (
    <DashboardShell
      user={data.doctor}
      title="My profile"
      subtitle="Your professional and contact details."
      onLogout={handleLogout}
    >
      {editing ? (
        <EditProfileForm
          user={data.doctor}
          profile={data.profile}
          submit={updateDoctorProfile}
          onCancel={() => setEditing(false)}
          onSaved={async () => {
            await refetch();
            setEditing(false);
          }}
        />
      ) : (
        <ProfileCard
          user={data.doctor}
          profile={data.profile}
          onEdit={() => setEditing(true)}
        />
      )}
    </DashboardShell>
  );
}

export default function DoctorProfilePage() {
  return (
    <Suspense fallback={<PageLoader label="Loading your profile..." />}>
      <DoctorProfileContent />
    </Suspense>
  );
}