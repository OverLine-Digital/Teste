"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { REGULATED_SECTORS } from "@/lib/sectors";
import type { AccountType } from "@/lib/types";

type DocumentType =
  | "nif"
  | "registre_commerce"
  | "piece_identite"
  | "justificatif_adresse"
  | "licence_exploitation";

type DocumentSpec = {
  type: DocumentType;
  label: string;
  helper?: string;
};

const ENTREPRISE_DOCUMENTS: DocumentSpec[] = [
  { type: "nif", label: "NIF / RCCM / TIN", helper: "Numéro d'identification fiscale de votre pays" },
  { type: "registre_commerce", label: "Registre de commerce", helper: "Certificat d'enregistrement" },
  { type: "piece_identite", label: "Pièce d'identité du représentant légal" },
  { type: "justificatif_adresse", label: "Justificatif d'adresse de l'entreprise" },
];

const LICENCE_DOCUMENT: DocumentSpec = {
  type: "licence_exploitation",
  label: "Licence d'exploitation",
  helper: "Requise pour votre secteur d'activité",
};

const INDIVIDUEL_DOCUMENTS: DocumentSpec[] = [
  { type: "piece_identite", label: "Pièce d'identité" },
  { type: "justificatif_adresse", label: "Justificatif d'adresse personnelle" },
];

type UploadState = "idle" | "uploading" | "done" | "error";

export default function VerificationPage() {
  const router = useRouter();
  const supabase = createClient();

  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [sectors, setSectors] = useState<string[]>([]);
  const [uploadStates, setUploadStates] = useState<Record<string, UploadState>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loadingContext, setLoadingContext] = useState(true);

  useEffect(() => {
    async function loadContext() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", user.id)
        .single();

      setAccountType((profile?.account_type as AccountType) ?? "individuel");

      const { data: company } = await supabase
        .from("companies")
        .select("id, sectors")
        .eq("user_id", user.id)
        .single();

      setCompanyId(company?.id ?? null);
      setSectors(company?.sectors ?? []);

      setLoadingContext(false);
    }
    loadContext();
  }, [supabase]);

  const isRegulatedSector = sectors.some((s) =>
    (REGULATED_SECTORS as readonly string[]).includes(s)
  );

  const documents: DocumentSpec[] =
    accountType === "entreprise"
      ? isRegulatedSector
        ? [...ENTREPRISE_DOCUMENTS, LICENCE_DOCUMENT]
        : ENTREPRISE_DOCUMENTS
      : INDIVIDUEL_DOCUMENTS;

  async function handleUpload(docType: DocumentType, file: File) {
    if (!userId) return;

    setUploadStates((prev) => ({ ...prev, [docType]: "uploading" }));
    setGlobalError(null);

    const path = `${userId}/${docType}-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("verification-documents")
      .upload(path, file);

    if (uploadError) {
      setUploadStates((prev) => ({ ...prev, [docType]: "error" }));
      setGlobalError("Échec de l'envoi du fichier. Réessayez.");
      return;
    }

    const { error: insertError } = await supabase.from("verifications").insert({
      company_id: companyId,
      document_type: docType,
      document_url: path,
      status: "pending",
    });

    if (insertError) {
      setUploadStates((prev) => ({ ...prev, [docType]: "error" }));
      setGlobalError("Le fichier est envoyé mais son enregistrement a échoué. Contactez le support.");
      return;
    }

    setUploadStates((prev) => ({ ...prev, [docType]: "done" }));
  }

  const allUploaded = documents.every((doc) => uploadStates[doc.type] === "done");

  function handleContinueToDashboard() {
    // La vérification n'est pas bloquante pour consulter le feed —
    // seulement pour publier/contacter, contrôlé ailleurs dans l'app.
    router.push("/feed");
  }

  if (loadingContext) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone">
        <p className="font-sans text-sm text-ink/60">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-lg border border-line p-8">
        <h1 className="font-display text-2xl text-ink mb-1">Vérification de votre compte</h1>
        <p className="font-sans text-sm text-ink/60 mb-6">
          Ces documents nous permettent de vous attribuer le badge{" "}
          {accountType === "entreprise" ? "« Verified Business »" : "« Vérifié »"}. Vous pouvez déjà
          explorer la plateforme, mais publier et contacter d'autres membres nécessite cette étape.
        </p>

        <div className="flex flex-col gap-4">
          {documents.map((doc) => (
            <DocumentUploadRow
              key={doc.type}
              doc={doc}
              state={uploadStates[doc.type] ?? "idle"}
              onFileSelected={(file) => handleUpload(doc.type, file)}
            />
          ))}
        </div>

        {globalError && <p className="font-sans text-sm text-clay mt-4">{globalError}</p>}

        <div className="mt-8 flex flex-col gap-3">
          <Button type="button" onClick={handleContinueToDashboard} className="w-full">
            {allUploaded ? "Terminé — accéder à la plateforme" : "Continuer plus tard"}
          </Button>
          {!allUploaded && (
            <p className="font-sans text-xs text-ink/50 text-center">
              Vous pourrez terminer votre vérification depuis votre profil à tout moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DocumentUploadRow({
  doc,
  state,
  onFileSelected,
}: {
  doc: DocumentSpec;
  state: UploadState;
  onFileSelected: (file: File) => void;
}) {
  const inputId = `upload-${doc.type}`;

  return (
    <div className="flex items-center justify-between gap-4 border border-line rounded-md px-4 py-3.5">
      <div>
        <p className="font-sans text-sm font-medium text-ink">{doc.label}</p>
        {doc.helper && <p className="font-sans text-xs text-ink/50 mt-0.5">{doc.helper}</p>}
      </div>

      <label htmlFor={inputId} className="shrink-0">
        <input
          id={inputId}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelected(file);
          }}
        />
        <span
          className={`font-sans text-xs font-medium rounded-md px-3 py-2 cursor-pointer transition-colors inline-block ${
            state === "done"
              ? "bg-teal/10 text-teal"
              : state === "error"
              ? "bg-clay/10 text-clay"
              : state === "uploading"
              ? "bg-stone-dim text-ink/50"
              : "bg-indigo/10 text-indigo hover:bg-indigo/20"
          }`}
        >
          {state === "done"
            ? "✓ Envoyé"
            : state === "uploading"
            ? "Envoi…"
            : state === "error"
            ? "Réessayer"
            : "Choisir un fichier"}
        </span>
      </label>
    </div>
  );
}
