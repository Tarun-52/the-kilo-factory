"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/store";

/**
 * Syncs NextAuth session into the Zustand store so that
 * existing components reading `user` / `isAdmin` keep working.
 */
export function useAuthSync() {
  const { data: session, status } = useSession();
  const setUser = useAppStore((s) => s.setUser);
  const logout = useAppStore((s) => s.logout);
  const prevIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.id) {
      if (prevIdRef.current !== session.user.id) {
        prevIdRef.current = session.user.id;
        setUser(
          {
            id: session.user.id,
            name: session.user.name ?? "User",
            mobile: "",
          },
          session.user.isAdmin === true
        );
      }
    } else if (prevIdRef.current) {
      prevIdRef.current = null;
      logout();
    }
  }, [session, status, setUser, logout]);
}