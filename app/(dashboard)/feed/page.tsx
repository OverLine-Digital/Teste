import { createClient } from "@/lib/supabase/server";
import { NewPostForm } from "@/components/feed/NewPostForm";
import { PostCard, type FeedPost } from "@/components/feed/PostCard";
import { PhotoSearch } from "@/components/search/PhotoSearch";

export default async function FeedPage() {
  const supabase = await createClient();

  // RLS (posts_select_selon_audience) filtre déjà automatiquement les
  // publications entreprises_uniquement selon le rôle de l'utilisateur
  // connecté — aucun filtrage supplémentaire à faire côté application.
  const { data: posts } = await supabase
    .from("posts")
    .select(
      `id, type, content, created_at,
       profiles:author_id ( id, full_name, role, companies ( id, name, verification_status ) )`
    )
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl text-ink">Feed</h1>
        <p className="font-sans text-sm text-ink/60 mt-1">
          Les demandes et opportunités pertinentes pour votre profil.
        </p>
      </div>

      <PhotoSearch />

      <NewPostForm />

      <div className="flex flex-col gap-4">
        {(posts as unknown as FeedPost[] | null)?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {posts?.length === 0 && (
          <p className="font-sans text-sm text-ink/50 text-center py-8">
            Aucune publication pour l'instant. Soyez le premier à publier.
          </p>
        )}
      </div>
    </div>
  );
}
