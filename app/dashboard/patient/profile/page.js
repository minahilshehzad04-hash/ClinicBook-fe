"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import DashboardError from "@/components/Dashboard/DashboardError";
import DashboardShell from "@/components/Dashboard/DashboardShell";
import EditProfileForm from "@/components/Dashboard/EditProfileForm";
import { PageLoader } from "@/components/Loader";
import ProfileCard from "@/components/Dashboard/ProfileCard";
import { getPatientDashboard, updateMyProfile } from "@/app/lib/api";
import { useDashboard } from "@/app/lib/useDashboard";

function PatientProfileContent() {
  const { data, error, handleLogout, refetch } = useDashboard(getPatientDashboard, "patient");
  const [editing, setEditing] = useState(false);
  const wantsEdit = useSearchParams().get("edit") === "1";

  useEffect(() => {
    if (wantsEdit) setEditing(true);
  }, [wantsEdit]);

  if (error) return <DashboardError error={error} onLogout={handleLogout} />;
  if (!data) return <PageLoader label="Loading your profile..." />;

  return (
    <DashboardShell
      user={data.patient}
      title="My profile"
      subtitle="Your personal and contact details."
      onLogout={handleLogout}
    >
      {editing ? (
        <EditProfileForm
          user={data.patient}
          submit={updateMyProfile}
          onCancel={() => setEditing(false)}
          onSaved={async () => {
            await refetch();
            setEditing(false);
          }}
        />
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setEditing(true)}
            className="rounded-xl bg-teal-800 px-4 py-2 text-sm font-medium text-white"
          >
            Update profile
          </button>
          <ProfileCard user={data.patient} />
        </div>
      )}
    </DashboardShell>
  );
}

export default function PatientProfilePage() {
  return (
    <Suspense fallback={<PageLoader label="Loading your profile..." />}>
      <PatientProfileContent />
    </Suspense>
  );
}