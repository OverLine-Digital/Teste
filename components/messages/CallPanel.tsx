"use client";

import { useEffect, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  RemoteTrack,
  RemoteParticipant,
  Track,
  createLocalTracks,
} from "livekit-client";
import { Button } from "@/components/ui/Button";

type CallState = "idle" | "connecting" | "connected" | "error";

export function CallPanel({ conversationId }: { conversationId: string }) {
  const [state, setState] = useState<CallState>("idle");
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const roomRef = useRef<Room | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteContainerRef = useRef<HTMLDivElement>(null);

  async function startCall(withVideo: boolean) {
    setState("connecting");
    setError(null);
    setVideoEnabled(withVideo);

    try {
      const res = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      const { token, url, error: apiError } = await res.json();

      if (!res.ok) throw new Error(apiError ?? "Impossible de générer le token d'appel");

      const room = new Room();
      roomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, _pub, _participant: RemoteParticipant) => {
        if (track.kind === Track.Kind.Video || track.kind === Track.Kind.Audio) {
          const el = track.attach();
          remoteContainerRef.current?.appendChild(el);
        }
      });

      room.on(RoomEvent.Disconnected, () => setState("idle"));

      await room.connect(url, token);

      const localTracks = await createLocalTracks({ audio: true, video: withVideo });
      for (const track of localTracks) {
        await room.localParticipant.publishTrack(track);
        if (track.kind === Track.Kind.Video && localVideoRef.current) {
          track.attach(localVideoRef.current);
        }
      }

      setState("connected");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la connexion à l'appel");
      setState("error");
    }
  }

  function endCall() {
    roomRef.current?.disconnect();
    roomRef.current = null;
    setState("idle");
  }

  useEffect(() => {
    return () => {
      roomRef.current?.disconnect();
    };
  }, []);

  if (state === "idle" || state === "error") {
    return (
      <div className="flex flex-col gap-2 border border-line rounded-lg p-4 bg-white">
        {error && <p className="font-sans text-xs text-clay">{error}</p>}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => startCall(false)}>
            📞 Appel vocal
          </Button>
          <Button variant="secondary" onClick={() => startCall(true)}>
            🎥 Appel vidéo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 border border-line rounded-lg p-4 bg-ink">
      <div ref={remoteContainerRef} className="flex flex-wrap gap-2 [&>video]:rounded-md [&>video]:max-h-48" />

      {videoEnabled && (
        <video ref={localVideoRef} autoPlay muted className="w-32 rounded-md self-end" />
      )}

      <div className="flex items-center justify-between">
        <span className="font-sans text-xs text-stone/70">
          {state === "connecting" ? "Connexion…" : "En communication"}
        </span>
        <Button variant="secondary" onClick={endCall} className="bg-clay text-stone border-clay">
          Raccrocher
        </Button>
      </div>
    </div>
  );
}
