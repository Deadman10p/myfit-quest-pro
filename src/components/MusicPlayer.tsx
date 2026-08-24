import React, { useEffect, useRef, useState } from "react";
import { Music, Play, Pause, SkipForward, SkipBack, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Track {
  id: string;
  title: string;
  artist: string | null;
  genre: string | null;
  bpm: number | null;
  audio_url: string;
  cover_url: string | null;
}

const MusicPlayer: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    supabase.from("music_tracks").select("*").eq("is_published", true).order("created_at", { ascending: false })
      .then(({ data }) => setTracks((data ?? []) as Track[]));
  }, []);

  const current = tracks[idx];

  useEffect(() => {
    if (!audioRef.current || !current) return;
    if (playing) audioRef.current.play().catch(() => setPlaying(false));
    else audioRef.current.pause();
  }, [playing, idx, current?.id]);

  const next = () => setIdx(i => (tracks.length ? (i + 1) % tracks.length : 0));
  const prev = () => setIdx(i => (tracks.length ? (i - 1 + tracks.length) % tracks.length : 0));

  if (!tracks.length) return null;

  return (
    <>
      <audio ref={audioRef} src={current?.audio_url} onEnded={next} loop={tracks.length === 1} />
      {!open ? (
        <button onClick={() => setOpen(true)}
          className={cn("flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs text-foreground touch-target", compact && "px-2")}
          aria-label="Open workout music player">
          <Music className={cn("w-4 h-4", playing ? "text-primary animate-pulse" : "text-muted-foreground")} />
          {!compact && <span className="truncate max-w-[110px]">{playing ? current?.title : "Music"}</span>}
        </button>
      ) : (
        <div className="flex items-center gap-2 rounded-xl bg-card border border-border px-3 py-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate max-w-[120px]">{current?.title}</p>
            <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">
              {[current?.artist, current?.bpm ? `${current.bpm} BPM` : null].filter(Boolean).join(" • ")}
            </p>
          </div>
          <button onClick={prev} className="touch-target" aria-label="Previous track"><SkipBack className="w-4 h-4 text-muted-foreground" /></button>
          <button onClick={() => setPlaying(p => !p)} className="touch-target" aria-label={playing ? "Pause music" : "Play music"}>
            {playing ? <Pause className="w-5 h-5 text-primary" /> : <Play className="w-5 h-5 text-primary" />}
          </button>
          <button onClick={next} className="touch-target" aria-label="Next track"><SkipForward className="w-4 h-4 text-muted-foreground" /></button>
          <button onClick={() => setOpen(false)} className="touch-target" aria-label="Close music player"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
      )}
    </>
  );
};

export default MusicPlayer;
