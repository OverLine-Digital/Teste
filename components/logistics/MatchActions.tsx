"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function MatchActions({ matchId }: { matchId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState<"accept" | "refuse" | null>(null);

  async function handle(status: "accepte" | "refuse") {
    setLoading(status === "accepte" ? "accept" : "refuse");
    await supabase.from("logistics_matches").update({ status }).eq("id", matchId);
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex gap-2 shrink-0">
      <Button variant="secondary" onClick={() => handle("refuse")} loading={loading === "refuse"}>
        Refuser
      </Button>
      <Button onClick={() => handle("accepte")} loading={loading === "accept"}>
        Accepter
      </Button>
    </div>
  );
}
