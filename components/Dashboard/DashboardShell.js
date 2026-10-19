"use client";

import Link from "next/link";
import { useState } from "react";

import { NAV_LINKS } from "@/app/lib/navigation";
import { getInitials } from "@/app/lib/user";
import NavIcon from "./NavIcon";
import Sidebar from "./Sidebar";

// Page frame shared by every dashboard: sidebar + top bar + title.
export default function DashboardShell({ user, title, subtitle, onLogout, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = NAV_LINKS[user?.role] ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        links={links}
        user={user}
        onLogout={onLogout}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <NavIcon name="menu" />
          </button>

          <p className="hidden text-sm text-slate-500 lg:block">
            Welcome back{user?.first_name ? `, ${user.first_name}` : ""}
          </p>

          <Link
            href={`/dashboard/${user?.role}/profile?edit=1`}
            title="Edit profile"
            aria-label="Edit profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-900 text-xs font-medium text-white transition hover:ring-4 hover:ring-teal-200"
          >
            {getInitials(user)}
          </Link>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1 text-slate-600">{subtitle}</p>}
          <div className="mt-6 space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}