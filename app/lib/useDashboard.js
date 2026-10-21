"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { clearTokens, getSavedRole, homeFor, isLoggedIn, logout } from "./api";

/**
 *   const { data, error, handleLogout, refetch } = useDashboard(getPatientDashboard, "patient");
 *
 * `fetcher` must be a stable function (an imported one, not an inline arrow).
 */
export function useDashboard(fetcher, role) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      if (err.status === 401) {
        clearTokens();
        router.replace("/login");
      } else {
        setError(err);
      }
    }
  }, [fetcher, router]);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    const savedRole = getSavedRole();
    if (savedRole && savedRole !== role) {
      router.replace(homeFor(savedRole) || "/login");
      return;
    }
    load();
  }, [router, role, load]);

  function handleLogout() {
    const logoutRequest = logout();
    router.replace("/login");
    return logoutRequest;
  }

  return { data, error, handleLogout, refetch: load };
}