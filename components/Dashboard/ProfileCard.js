import { getFullName, getInitials } from "@/app/lib/user";
import NavIcon from "./NavIcon";

function formatDate(iso) {
  if (!iso) return "-";
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ContactItem({ icon, label, value }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
        <NavIcon name={icon} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="break-words text-sm font-medium text-slate-900">{value || "-"}</p>
      </div>
    </li>
  );
}

function InfoRow({ label, value, capitalize = false }) {
  return (
    <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd
        className={`break-words text-sm font-medium text-slate-900 sm:max-w-[60%] sm:text-right ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value || "-"}
      </dd>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

// Full details of the signed-in user. `profile` is passed for doctors only.
export default function ProfileCard({ user, profile }) {
  if (!user) return null;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-teal-800 to-teal-600 p-6 text-white sm:p-8">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 right-28 h-40 w-40 rounded-full bg-white/10" />

        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white/15 text-3xl font-semibold ring-4 ring-white/30">
            {getInitials(user)}
          </span>

          <div className="min-w-0">
            <h2 className="truncate text-2xl font-semibold sm:text-3xl">
              {getFullName(user) || user.email}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium capitalize">
                {user.role}
              </span>
              {profile?.specialty && (
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                  {profile.specialty}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Contact">
          <ul className="space-y-5">
            <ContactItem icon="mail" label="Email" value={user.email} />
            <ContactItem icon="phone" label="Phone" value={user.phone} />
            <ContactItem
              icon="cake"
              label="Date of birth"
              value={formatDate(user.date_of_birth)}
            />
          </ul>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card title="Personal information">
            <dl className="divide-y divide-slate-100">
              <InfoRow label="First name" value={user.first_name} />
              <InfoRow label="Last name" value={user.last_name} />
              <InfoRow label="Date of birth" value={formatDate(user.date_of_birth)} />
              <InfoRow label="Phone" value={user.phone} />
            </dl>
          </Card>

          {profile && (
            <Card title="Professional details">
              <dl className="divide-y divide-slate-100">
                <InfoRow label="Specialty" value={profile.specialty} />
                <InfoRow label="Qualification" value={profile.qualification} />
                <InfoRow
                  label="Experience"
                  value={
                    profile.years_of_experience != null
                      ? `${profile.years_of_experience} years`
                      : ""
                  }
                />
                <InfoRow label="License number" value={profile.license_number} />
                <InfoRow
                  label="Consultation fee"
                  value={
                    profile.consultation_fee != null ? `Rs ${profile.consultation_fee}` : ""
                  }
                />
                <InfoRow label="About" value={profile.bio} />
              </dl>
            </Card>
          )}

          <Card title="Account">
            <dl className="divide-y divide-slate-100">
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Role" value={user.role} capitalize />
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}