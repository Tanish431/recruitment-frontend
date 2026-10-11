"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Round3JoinPanel } from "@/components/judge/Round3JoinPanel";
import { PageLoading } from "@/components/ui";

export default function Page() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.auth
      .me()
      .then((u) => {
        if (u.role === "admin") router.replace("/judge/round3/manage");
        else setReady(true);
      })
      .catch(() => router.replace("/"));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return <PageLoading />;
  return <Round3JoinPanel />;
}
