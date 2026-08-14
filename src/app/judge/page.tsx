"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveRound } from "@/components/RoundLocationPicker";
import { PageLoading, EmptyState } from "@/components/ui";

export default function JudgeIndex() {
  const router = useRouter();
  const { round, loading } = useActiveRound();

  useEffect(() => {
    if (loading || !round) return;
    router.replace(round.number === 2 ? "/judge/round2" : "/judge/queue");
  }, [round, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <PageLoading />;

  if (!round) {
    return (
      <EmptyState
        title="No round active"
        subtitle="The admin hasn't activated a round yet. Check back once one is live."
      />
    );
  }

  return <PageLoading />; // brief flash while the redirect above fires
}
