export const NAV_LINKS = {
  patient: [
    { label: "Overview", href: "/dashboard/patient", icon: "home", exact: true },
    { label: "Appointments", href: "/dashboard/patient/appointments", icon: "calendar" },
    { label: "Profile", href: "/dashboard/patient/profile", icon: "user" },
  ],
  doctor: [
    { label: "Overview", href: "/dashboard/doctor", icon: "home", exact: true },
    { label: "Schedule", href: "/dashboard/doctor/schedule", icon: "calendar" },
    { label: "Profile", href: "/dashboard/doctor/profile", icon: "user" },
  ],
  admin: [
    { label: "Overview", href: "/dashboard/admin", icon: "home", exact: true },
    { label: "Profile", href: "/dashboard/admin/profile", icon: "user" },
  ],
};