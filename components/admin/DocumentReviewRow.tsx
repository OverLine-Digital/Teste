"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function DocumentReviewRow({
  verificationId,
  documentType,
  documentUrl,
}: {
  verificationId: string;
  documentType: string;
  documentUrl: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  async function handleView() {
    const { data } = await supabase.storage
      .from("verification-documents")
      .createSignedUrl(documentUrl, 60);
    if (data?.signedUrl) setSignedUrl(data.signedUrl);
  }

  async function handleReview(status: "verified" | "rejected") {
    setLoading(status === "verified" ? "approve" : "reject");
    await supabase.rpc("admin_review_document", {
      target_verification_id: verificationId,
      new_status: status,
      rejection_reason_text: status === "rejected" ? "Document illisible ou non conforme" : null,
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between gap-3 border border-line rounded-md px-4 py-3">
      <div>
        <p className="font-sans text-sm font-medium text-ink">{documentType}</p>
        <button onClick={handleView} className="font-sans text-xs text-indigo underline">
          {signedUrl ? "Lien généré ↓" : "Voir le document"}
        </button>
        {signedUrl && (
          <a href={signedUrl} target="_blank" rel="noreferrer" className="block font-sans text-xs text-teal mt-1">
            Ouvrir dans un nouvel onglet
          </a>
        )}
      </div>
      <div className="flex gap-2 shrink-0">
        <Button variant="secondary" onClick={() => handleReview("rejected")} loading={loading === "reject"}>
          Rejeter
        </Button>
        <Button onClick={() => handleReview("verified")} loading={loading === "approve"}>
          Approuver
        </Button>
      </div>
    </div>
  );
}
