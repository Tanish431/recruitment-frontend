"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useActiveRound } from "@/components/RoundLocationPicker";
import { PageLoading, EmptyState } from "@/components/ui";

export default function JudgeIndex() {
  const router = useRouter();
  const { round, loading } = useActiveRound();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    api.auth
      .me()
      .then((u) => setRole(u.role))
      .catch(() => router.replace("/"));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (loading || !round || !role) return;
    if (round.number === 2) {
      router.replace("/judge/round2");
    } else if (round.number === 3) {
      router.replace(role === "admin" ? "/judge/round3/manage" : "/judge/round3");
    } else {
      router.replace("/judge/queue");
    }
  }, [round, loading, role]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <PageLoading />;

  if (!round) {
    return (
      <EmptyState
        title="No round active"
        subtitle="The admin hasn't activated a round yet. Check back once one is live."
      />
    );
  }

  return <PageLoading />;
}
