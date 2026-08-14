"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "./api";
import type { User } from "./types";

export function useRequireRole(allowed: User["role"][]) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.auth
      .me()
      .then((u) => {
        if (!allowed.includes(u.role)) {
          router.replace("/dashboard");
          return;
        }
        setUser(u);
      })
      .catch(() => router.replace("/"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { user, loading };
}
