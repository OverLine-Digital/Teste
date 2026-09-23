"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import clsx from "clsx";

type StructuredData = { price?: number; currency?: string; quantity?: number; unit?: string; delay_days?: number } | null;

type Message = {
  id: string;
  content: string | null;
  sender_profile_id: string;
  created_at: string;
  read_at: string | null;
  structured_data?: StructuredData;
};

export function ConversationThread({
  conversationId,
  currentUserId,
  initialMessages,
  preferredLanguageCode,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
  preferredLanguageCode: string;
}) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [delayDays, setDelayDays] = useState("");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translating, setTranslating] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function handleTranslate(messageId: string) {
    setTranslating(messageId);
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId, targetLanguageCode: preferredLanguageCode }),
    });
    const data = await res.json();
    setTranslating(null);
    if (data.translated) {
      setTranslations((prev) => ({ ...prev, [messageId]: data.translated }));
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Messagerie en temps réel — un nouveau message de l'autre participant
  // apparaît sans recharger la page.
  useEffect(() => {
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new as Message];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() && !price && !quantity) return;

    setSending(true);
    const content = draft.trim();
    const structured_data: StructuredData =
      price || quantity || delayDays
        ? {
            price: price ? Number(price) : undefined,
            currency: "USD",
            quantity: quantity ? Number(quantity) : undefined,
            delay_days: delayDays ? Number(delayDays) : undefined,
          }
        : null;

    setDraft("");
    setPrice("");
    setQuantity("");
    setDelayDays("");
    setShowNegotiation(false);

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_profile_id: currentUserId,
      content: content || null,
      structured_data,
    });

    setSending(false);
    if (error) setDraft(content);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 px-1 py-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={clsx(
              "max-w-[75%] rounded-lg px-4 py-2.5 font-sans text-sm flex flex-col gap-1.5",
              msg.sender_profile_id === currentUserId
                ? "bg-indigo text-stone self-end"
                : "bg-white border border-line text-ink self-start"
            )}
          >
            {msg.content && <span>{msg.content}</span>}
            {translations[msg.id] && (
              <span className="italic opacity-80 border-t border-current/20 pt-1.5">
                {translations[msg.id]}
              </span>
            )}
            {msg.sender_profile_id !== currentUserId && msg.content && !translations[msg.id] && (
              <button
                type="button"
                onClick={() => handleTranslate(msg.id)}
                className="self-start font-sans text-xs text-indigo underline opacity-70"
              >
                {translating === msg.id ? "Traduction…" : "🌐 Traduire"}
              </button>
            )}
            {msg.structured_data && (
              <div
                className={clsx(
                  "rounded-md px-3 py-2 text-xs grid grid-cols-2 gap-x-3 gap-y-1",
                  msg.sender_profile_id === currentUserId ? "bg-white/15" : "bg-stone"
                )}
              >
                {msg.structured_data.price != null && (
                  <>
                    <span className="opacity-70">Prix</span>
                    <span className="font-medium">{msg.structured_data.price} {msg.structured_data.currency}</span>
                  </>
                )}
                {msg.structured_data.quantity != null && (
                  <>
                    <span className="opacity-70">Quantité</span>
                    <span className="font-medium">{msg.structured_data.quantity}</span>
                  </>
                )}
                {msg.structured_data.delay_days != null && (
                  <>
                    <span className="opacity-70">Délai</span>
                    <span className="font-medium">{msg.structured_data.delay_days} j</span>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {showNegotiation && (
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-line">
          <input
            type="number"
            placeholder="Prix"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="font-sans text-xs rounded-md border border-line px-2.5 py-2"
          />
          <input
            type="number"
            placeholder="Quantité"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="font-sans text-xs rounded-md border border-line px-2.5 py-2"
          />
          <input
            type="number"
            placeholder="Délai (jours)"
            value={delayDays}
            onChange={(e) => setDelayDays(e.target.value)}
            className="font-sans text-xs rounded-md border border-line px-2.5 py-2"
          />
        </div>
      )}

      <form onSubmit={handleSend} className="flex gap-2 pt-3 border-t border-line">
        <button
          type="button"
          onClick={() => setShowNegotiation((v) => !v)}
          className="font-sans text-xs text-indigo border border-indigo/30 rounded-md px-2.5 shrink-0"
          title="Ajouter prix/quantité/délai"
        >
          📋
        </button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Écrire un message…"
          className="flex-1 font-sans text-sm rounded-md border border-line bg-white px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo/40"
        />
        <Button type="submit" loading={sending} disabled={!draft.trim() && !price && !quantity}>
          Envoyer
        </Button>
      </form>
    </div>
  );
}
