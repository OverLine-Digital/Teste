import { createClient } from "@/lib/supabase/server";

const TYPE_ICONS: Record<string, string> = {
  nouveau_message: "💬",
  verification_verified: "✅",
  verification_rejected: "⚠️",
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, content, read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // Marque tout comme lu à la consultation de la page
  await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);

  return (
    <div className="max-w-2xl flex flex-col gap-4">
      <h1 className="font-display text-2xl text-ink">Notifications</h1>

      <div className="flex flex-col divide-y divide-line bg-white border border-line rounded-lg overflow-hidden">
        {notifications?.map((n) => (
          <div key={n.id} className={`px-5 py-4 flex gap-3 ${!n.read ? "bg-indigo/5" : ""}`}>
            <span className="text-lg">{TYPE_ICONS[n.type] ?? "🔔"}</span>
            <div>
              <p className="font-sans text-sm text-ink">{n.content}</p>
              <p className="font-sans text-xs text-ink/40 mt-0.5">
                {new Date(n.created_at).toLocaleString("fr-FR")}
              </p>
            </div>
          </div>
        ))}

        {(!notifications || notifications.length === 0) && (
          <p className="font-sans text-sm text-ink/50 text-center py-10">Aucune notification.</p>
        )}
      </div>
    </div>
  );
}
