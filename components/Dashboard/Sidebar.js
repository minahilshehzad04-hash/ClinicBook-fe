"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getFullName, getInitials } from "@/app/lib/user";
import Logo from "@/components/Logo";
import NavIcon from "./NavIcon";

// Reusable sidebar. Pass any list of links, so it works for every role.
//   links:   [{ label, href, icon, exact? }]
//   open:    mobile drawer state (desktop is always visible)
export default function Sidebar({ links = [], user, open = false, onClose }) {
    const pathname = usePathname();

    const isActive = (link) =>
        link.exact
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(`${link.href}/`);

    return (
        <>
            {/* Dark overlay behind the mobile drawer */}
            <div
                onClick={onClose}
                className={`fixed inset-0 z-40 bg-slate-900/40 transition-opacity lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
            />

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Brand */}
                <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
                    <Logo size="sm" href={user?.role ? `/dashboard/${user.role}` : "/"} />
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 lg:hidden"
                        aria-label="Close menu"
                    >
                        <NavIcon name="close" />
                    </button>
                </div>

                {/* Links */}
                <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                    {links.map((link) => {
                        const active = isActive(link);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={onClose}
                                aria-current={active ? "page" : undefined}
                                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active
                                        ? "bg-teal-50 text-teal-900"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                            >
                                <NavIcon name={link.icon} />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Signed-in user */}
                <div className="border-t border-slate-200 p-3">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-900 text-sm font-medium text-white">
                            {getInitials(user)}
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">
                                {getFullName(user) || user?.email}
                            </p>
                            <p className="text-xs capitalize text-slate-500">{user?.role}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}