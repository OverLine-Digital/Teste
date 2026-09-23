import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: myConversations } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", user.id);

  const conversationIds = myConversations?.map((c) => c.conversation_id) ?? [];

  const { data: conversations } = await supabase
    .from("conversations")
    .select(
      `id, created_at,
       conversation_participants ( profile_id, profiles ( full_name, companies ( name ) ) ),
       messages ( content, created_at, sender_profile_id )`
    )
    .in("id", conversationIds)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h1 className="font-display text-2xl text-ink">Messagerie</h1>

      <div className="flex flex-col divide-y divide-line bg-white border border-line rounded-lg overflow-hidden">
        {conversations?.map((conv) => {
          const otherParticipant = conv.conversation_participants?.find(
            (p: any) => p.profile_id !== user.id
          );
          const otherName =
            otherParticipant?.profiles?.companies?.[0]?.name ??
            otherParticipant?.profiles?.full_name ??
            "Conversation";
          const lastMessage = [...(conv.messages ?? [])].sort(
            (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0];

          return (
            <Link
              key={conv.id}
              href={`/messages/${conv.id}`}
              className="px-5 py-4 hover:bg-stone-dim transition-colors flex flex-col gap-0.5"
            >
              <span className="font-sans text-sm font-semibold text-ink">{otherName}</span>
              <span className="font-sans text-xs text-ink/50 truncate">
                {lastMessage?.content ?? "Aucun message"}
              </span>
            </Link>
          );
        })}

        {(!conversations || conversations.length === 0) && (
          <p className="font-sans text-sm text-ink/50 text-center py-10">
            Aucune conversation pour l'instant.
          </p>
        )}
      </div>
    </div>
  );
}
