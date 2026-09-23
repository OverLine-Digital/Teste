import Link from "next/link";

export type FeedPost = {
  id: string;
  type: string;
  content: string;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    role: string | null;
    companies: { id: string; name: string; verification_status: string }[] | null;
  } | null;
};

const TYPE_LABELS: Record<string, string> = {
  recherche_fournisseur: "Recherche fournisseur",
  recherche_distributeur: "Recherche distributeur",
  rfq: "Demande de devis (RFQ)",
  annonce: "Annonce",
  capacite_disponible: "Capacité disponible",
  recherche_partenaire_business: "Recherche de partenaire",
  offre_emploi: "Offre d'emploi",
  offre_freelance: "Offre de service freelance",
};

export function PostCard({ post }: { post: FeedPost }) {
  const timeAgo = formatTimeAgo(new Date(post.created_at));
  // companies est un tableau côté PostgREST (relation inverse 1-to-many
  // déclarée), mais un profil n'a jamais plus d'une entreprise en pratique.
  const company = post.profiles?.companies?.[0] ?? null;
  const displayName = company?.name ?? post.profiles?.full_name ?? "Compte supprimé";
  const profileHref = company ? `/entreprise/${company.id}` : `/profil/${post.profiles?.id}`;

  return (
    <article className="bg-white border border-line rounded-lg p-5">
      <div className="flex items-start justify-between mb-2">
        <div>
          <Link href={profileHref} className="font-sans text-sm font-semibold text-ink hover:text-indigo">
            {displayName}
          </Link>
          {company?.verification_status === "verified" && (
            <span className="ml-1.5 text-teal text-xs" title="Vérifié">
              ✓
            </span>
          )}
          <p className="font-sans text-xs text-ink/50 mt-0.5">{timeAgo}</p>
        </div>
        <span className="font-sans text-xs font-medium text-indigo bg-indigo/10 rounded-full px-2.5 py-1 shrink-0">
          {TYPE_LABELS[post.type] ?? post.type}
        </span>
      </div>
      <p className="font-sans text-sm text-ink whitespace-pre-wrap">{post.content}</p>
    </article>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "à l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}
