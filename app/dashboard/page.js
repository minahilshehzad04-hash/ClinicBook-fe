"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { clearTokens, getSavedRole, homeFor } from "../lib/api";

// /dashboard has no content of its own: send people to their role's portal.
export default function DashboardIndex() {
  const router = useRouter();

  useEffect(() => {
    const home = homeFor(getSavedRole());
    if (home) router.replace(home);
    else {
      clearTokens(); // signed in but no usable role: start fresh
      router.replace("/login");
    }
  }, [router]);

  return null;
}