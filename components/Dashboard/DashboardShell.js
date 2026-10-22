"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { NAV_LINKS } from "@/app/lib/navigation";
import { getInitials } from "@/app/lib/user";
import Logo from "@/components/Logo";
import NavIcon from "./NavIcon";
import Sidebar from "./Sidebar";

// Page frame shared by every dashboard: sidebar + top bar + title.
export default function DashboardShell({
  user,
  title,
  subtitle,
  headerAction,
  compactContent = false,
  onLogout,
  children,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const links = NAV_LINKS[user?.role] ?? [];

  // Close the profile menu on outside click or Escape
  useEffect(() => {
    if (!profileMenuOpen) return;

    const onClick = (e) => {
      if (!profileRef.current?.contains(e.target)) setProfileMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setProfileMenuOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [profileMenuOpen]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        links={links}
        user={user}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
          <div className="flex min-w-0 items-center gap-3 lg:gap-6">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <NavIcon name="menu" />
            </button>
            <div className="lg:hidden">
              <Logo size="sm" href={`/dashboard/${user?.role ?? ""}`} />
            </div>
            <p
              suppressHydrationWarning
              className="hidden text-sm text-slate-500 lg:block"
            >
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileMenuOpen((open) => !open)}
              title="Open profile menu"
              aria-label="Open profile menu"
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-900 text-xs font-medium text-white transition hover:ring-4 hover:ring-teal-200"
            >
              {getInitials(user)}
            </button>
            {profileMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
              >
                <Link
                  href={`/dashboard/${user?.role}/profile?edit=1`}
                  role="menuitem"
                  onClick={() => setProfileMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Edit profile
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onLogout?.();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  <NavIcon name="logout" className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
              {subtitle && <p className="mt-1 text-slate-600">{subtitle}</p>}
            </div>
            {headerAction}
          </div>
          <div className={compactContent ? "mt-4 space-y-4" : "mt-6 space-y-6"}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}