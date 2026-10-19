import Link from "next/link";

import { getFullName, getInitials } from "@/app/lib/user";
import SectionCard from "./SectionCard";

export default function ProfileSummary({ user, profileHref }) {
  return (
    <SectionCard
      title="Your profile"
      action={
        <Link
          href={profileHref}
          className="rounded-full border border-slate-300 px-5 py-2 text-sm text-slate-900 transition hover:bg-slate-50"
        >
          View profile
        </Link>
      }
    >
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-900 text-lg font-medium text-white">
          {getInitials(user)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-slate-900">{getFullName(user) || user.email}</p>
          <p className="truncate text-sm text-slate-500">{user.email}</p>
          {user.phone && <p className="text-sm text-slate-500">{user.phone}</p>}
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-600">
        Keep your contact details up to date so the clinic can reach you.
      </p>
    </SectionCard>
  );
}