import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConversationThread } from "@/components/messages/ConversationThread";
import { CallPanel } from "@/components/messages/CallPanel";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: messages } = await supabase
    .from("messages")
    .select("id, content, sender_profile_id, created_at, read_at, structured_data")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  const { data: profile } = await supabase
    .from("profiles")
    .select("preferred_language_code")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex flex-col gap-3 h-[calc(100vh-8rem)] max-w-2xl">
      <CallPanel conversationId={id} />
      <div className="flex-1 min-h-0">
        <ConversationThread
          conversationId={id}
          currentUserId={user.id}
          initialMessages={messages ?? []}
          preferredLanguageCode={profile?.preferred_language_code ?? "fr"}
        />
      </div>
    </div>
  );
}
