"use client";

// EXAMPLE: how to use the loaders on a data page. Adapt to your real dashboard.
import { useEffect, useState } from "react";

import { InlineLoader, PageLoader } from "@/components/Loader";
import { getPatientDashboard } from "../lib/api";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPatientDashboard().then(setData).catch(setError);
  }, []);

  if (error) return <p role="alert" className="p-6 text-red-700">{error.message}</p>;
  if (!data) return <PageLoader label="Loading your dashboard..." />;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      {/* For a single section that loads on its own: */}
      {/* {loadingAppointments ? <InlineLoader label="Loading appointments..." /> : <List />} */}
    </main>
  );
}