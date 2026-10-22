"use client";

import Link from "next/link";
import { Users, Stethoscope, MailWarning, UserX } from "lucide-react";

import DashboardError from "@/components/Dashboard/DashboardError";
import DashboardShell from "@/components/Dashboard/DashboardShell";
import { PageLoader } from "@/components/Loader";
import SectionCard from "@/components/Dashboard/SectionCard";
import StatCard from "@/components/Dashboard/StatCard";
import { getAdminDashboardPage } from "@/app/lib/api";
import { useDashboard } from "@/app/lib/useDashboard";

const ROLE_STYLES = {
  patient: "bg-teal-50 text-teal-800",
  doctor: "bg-sky-50 text-sky-800",
  admin: "bg-violet-50 text-violet-800",
};

const fullName = (u) =>
  [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email;

const initials = (u) =>
  fullName(u)
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

// /dashboard/admin
export default function AdminDashboardPage() {
  const { data, error, handleLogout } = useDashboard(getAdminDashboardPage, "admin");

  if (error) return <DashboardError error={error} onLogout={handleLogout} />;
  if (!data) return <PageLoader label="Loading your dashboard..." />;

  const admin = data.admin;
  const stats = data.stats ?? {};
  const recentUsers = data.recent_users ?? [];
  const unverified = stats.unverified_users ?? 0;

  return (
    <DashboardShell
      user={admin}
      title={data.message}
      subtitle="Here is the system at a glance."
      onLogout={handleLogout}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Patients" value={stats.patients ?? 0} icon={Users} tone="teal" />
        <StatCard label="Doctors" value={stats.doctors ?? 0} icon={Stethoscope} tone="blue" />
        <StatCard
          label="Unverified users"
          value={unverified}
          icon={MailWarning}
          tone={unverified > 0 ? "amber" : "slate"}
          hint={unverified > 0 ? "Waiting on email verification" : "All verified"}
        />
        <StatCard label="Inactive users" value={stats.inactive_users ?? 0} icon={UserX} tone="slate" />
      </div>

      <SectionCard
        title="Recent users"
        description="The five most recent sign-ups."
        emptyText="No users yet."
        action={
          <Link
            href="/dashboard/admin/users"
            className="text-sm font-medium text-teal-800 hover:underline"
          >
            View all
          </Link>
        }
      >
        {recentUsers.length > 0 && (
          <ul className="grid gap-3">
            {recentUsers.map((u) => (
              <li
                key={u.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
                  {initials(u)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{fullName(u)}</p>
                  <p className="truncate text-xs text-slate-500">
                    {u.email}
                    {u.date_joined && (
                      <> · Joined {new Date(u.date_joined).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
                {u.is_email_verified === false && (
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                    Unverified
                  </span>
                )}
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                    ROLE_STYLES[u.role] ?? "bg-slate-100 text-slate-700"
                  }`}
                >
                  {u.role}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </DashboardShell>
  );
}