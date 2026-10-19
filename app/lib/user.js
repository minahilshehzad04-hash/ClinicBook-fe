export function getFullName(user) {
  return [user?.first_name, user?.last_name].filter(Boolean).join(" ");
}

export function getInitials(user) {
  const first = user?.first_name?.[0] || user?.email?.[0] || "?";
  const last = user?.last_name?.[0] || "";
  return (first + last).toUpperCase();
}