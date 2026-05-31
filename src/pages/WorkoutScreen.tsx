import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Check, SkipForward, ThumbsDown, ThumbsUp, Home, Building2, Volume2, VolumeX, X, Dumbbell, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  rest_seconds: number;
  muscles: string[];
  form_tip: string | null;
  video_url: string | null;
  youtube_query: string | null;
  position: number;
}

interface Workout {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
  duration_min: number;
  environment: string;
  exercises: Exercise[];
}

const encouragements = [
  "You've got this! 💪",
  "One more rep, push through!",
  "Strong work, keep going!",
  "Feel that burn — that's progress!",
  "Champions are built right here!",
  "Breathe, focus, lift!",
  "Almost there, finish strong!",
];

const speak = (text: string, enabled: boolean) => {
  if (!enabled || !("speechSynthesis" in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1.05;
  utter.pitch = 1;
  utter.volume = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
};

const getYouTubeEmbed = (ex: Exercise) => {
  if (ex.video_url) {
    // accept full URLs or video IDs
    const idMatch = ex.video_url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
    if (idMatch) return `https://www.youtube.com/embed/${idMatch[1]}?autoplay=1&mute=1&controls=0&loop=1&playlist=${idMatch[1]}`;
    return ex.video_url;
  }
  const q = encodeURIComponent(ex.youtube_query || `${ex.name} exercise form`);
  // YouTube doesn't allow direct search embeds; fall back to a search-result link via a no-api embed via "videoseries" listType
  return `https://www.youtube.com/embed?listType=search&list=${q}`;
};

const WorkoutScreen: React.FC = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selected, setSelected] = useState<Workout | null>(null);
  const [mode, setMode] = useState<"plan" | "active">("plan");
  const [gymMode, setGymMode] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [setNum, setSetNum] = useState(1);
  const [resting, setResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [voiceOn, setVoiceOn] = useState(true);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadWorkouts = async (env: string) => {
    const { data: ws } = await supabase
      .from("workouts")
      .select("*, exercises(*)")
      .or(`environment.eq.${env},environment.eq.any`)
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    const sorted = (ws ?? []).map((w: any) => ({
      ...w,
      exercises: (w.exercises ?? []).sort((a: Exercise, b: Exercise) => a.position - b.position),
    }));
    setWorkouts(sorted as Workout[]);
  };

  const generateAIWorkout = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate-workout", {
        body: { environment: gymMode ? "gym" : "home", duration_min: 45 },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success("Your AI workout is ready! 🔥");
      await loadWorkouts(gymMode ? "gym" : "home");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate workout");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadWorkouts(gymMode ? "gym" : "home").finally(() => setLoading(false));
  }, [gymMode]);

  const activeEx = selected?.exercises[activeIdx];

  // Rest countdown with voice
  useEffect(() => {
    if (!resting) return;
    restTimerRef.current = setInterval(() => {
      setRestTime((prev) => {
        if (prev <= 1) {
          if (restTimerRef.current) clearInterval(restTimerRef.current);
          setResting(false);
          speak("Let's go! Next set.", voiceOn);
          return 0;
        }
        if ([3, 2, 1].includes(prev - 1)) speak(String(prev - 1), voiceOn);
        return prev - 1;
      });
    }, 1000);
    return () => { if (restTimerRef.current) clearInterval(restTimerRef.current); };
  }, [resting, voiceOn]);

  const startWorkout = (w: Workout) => {
    if (!w.exercises.length) { toast.error("This workout has no exercises yet."); return; }
    setSelected(w);
    setActiveIdx(0);
    setSetNum(1);
    setResting(false);
    setRestTime(0);
    setSessionStart(new Date());
    setMode("active");
    speak(`Starting ${w.title}. First exercise: ${w.exercises[0].name}. ${w.exercises[0].sets} sets of ${w.exercises[0].reps} reps.`, voiceOn);
  };

  const endWorkout = async (completed: boolean) => {
    if (sessionStart && selected && user) {
      const duration = Math.floor((Date.now() - sessionStart.getTime()) / 1000);
      const xp = completed ? selected.exercises.length * 25 : Math.floor(duration / 60) * 5;
      await supabase.from("workout_sessions").insert({
        user_id: user.id,
        workout_id: selected.id,
        completed_at: completed ? new Date().toISOString() : null,
        duration_seconds: duration,
        xp_earned: xp,
      });
      if (completed) {
        const { data: prof } = await supabase.from("profiles").select("xp").eq("id", user.id).maybeSingle();
        await supabase.from("profiles").update({ xp: (prof?.xp ?? 0) + xp }).eq("id", user.id);
        toast.success(`Workout complete! +${xp} XP 🔥`);
      }
    }
    setMode("plan");
    setSelected(null);
    window.speechSynthesis?.cancel();
  };

  const completeSet = () => {
    if (!selected || !activeEx) return;
    if (setNum < activeEx.sets) {
      setSetNum((n) => n + 1);
      const msg = encouragements[Math.floor(Math.random() * encouragements.length)];
      speak(msg, voiceOn);
      setRestTime(activeEx.rest_seconds);
      setResting(true);
    } else {
      // next exercise
      if (activeIdx < selected.exercises.length - 1) {
        const nextEx = selected.exercises[activeIdx + 1];
        speak(`Great job! Next up: ${nextEx.name}. ${nextEx.sets} sets of ${nextEx.reps}.`, voiceOn);
        setActiveIdx((i) => i + 1);
        setSetNum(1);
        setRestTime(activeEx.rest_seconds);
        setResting(true);
      } else {
        speak("Workout complete. Outstanding effort!", voiceOn);
        endWorkout(true);
      }
    }
  };

  const skipExercise = () => {
    if (!selected) return;
    if (activeIdx < selected.exercises.length - 1) {
      setActiveIdx((i) => i + 1);
      setSetNum(1);
      setResting(false);
    } else endWorkout(true);
  };

  // ---------- ACTIVE PLAYER ----------
  if (mode === "active" && selected && activeEx) {
    const progressPct = ((activeIdx + (setNum - 1) / activeEx.sets) / selected.exercises.length) * 100;
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <button onClick={() => endWorkout(false)} className="touch-target text-muted-foreground hover:text-foreground" aria-label="End workout">
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1 mx-3">
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div className="h-full bg-primary" animate={{ width: `${progressPct}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 text-center">{activeIdx + 1}/{selected.exercises.length} • {selected.title}</p>
          </div>
          <button onClick={() => setVoiceOn((v) => !v)} className="touch-target" aria-label={voiceOn ? "Mute voice" : "Unmute voice"}>
            {voiceOn ? <Volume2 className="w-5 h-5 text-primary" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
          </button>
        </div>

        {/* Video */}
        <div className="relative aspect-video bg-black">
          <iframe
            key={activeEx.id}
            src={getYouTubeEmbed(activeEx)}
            className="absolute inset-0 w-full h-full"
            title={activeEx.name}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>

        {/* Exercise info / rest countdown */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <AnimatePresence mode="wait">
            {resting ? (
              <motion.div key="rest" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-10">
                <p className="text-sm text-muted-foreground mb-2">Rest</p>
                <motion.p
                  key={restTime}
                  initial={{ scale: 1.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-7xl font-bold text-primary"
                >
                  {restTime}s
                </motion.p>
                <p className="text-foreground mt-3 text-center max-w-xs">{encouragements[restTime % encouragements.length]}</p>
                <Button variant="outline" className="mt-6 touch-target" onClick={() => { setResting(false); setRestTime(0); window.speechSynthesis?.cancel(); }}>
                  <SkipForward className="w-4 h-4 mr-1" /> Skip Rest
                </Button>
              </motion.div>
            ) : (
              <motion.div key={`${activeEx.id}-${setNum}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-bold text-foreground mb-1">{activeEx.name}</h2>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {activeEx.muscles.map((m) => <span key={m} className="text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary">{m}</span>)}
                </div>
                {activeEx.form_tip && <p className="text-sm text-muted-foreground mb-4">{activeEx.form_tip}</p>}

                <div className="bg-card border border-border rounded-2xl p-5 text-center mb-4">
                  <p className="text-xs text-muted-foreground mb-1">SET</p>
                  <p className="text-5xl font-bold text-foreground">{setNum}<span className="text-2xl text-muted-foreground">/{activeEx.sets}</span></p>
                  <p className="text-lg text-primary font-semibold mt-2">{activeEx.reps} reps</p>
                </div>

                <Button onClick={completeSet} className="w-full touch-target btn-primary-gradient text-primary-foreground font-bold text-lg h-14">
                  <Check className="w-5 h-5 mr-2" /> Complete Set
                </Button>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" className="flex-1 touch-target text-xs" onClick={skipExercise}>
                    <SkipForward className="w-3 h-3 mr-1" /> Skip Exercise
                  </Button>
                  <Button variant="outline" className="touch-target" size="icon" aria-label="Too easy"><ThumbsDown className="w-4 h-4" /></Button>
                  <Button variant="outline" className="touch-target" size="icon" aria-label="Too hard"><ThumbsUp className="w-4 h-4" /></Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ---------- PLAN LIST ----------
  return (
    <div className="px-4 py-4 space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Workouts</h2>
        <div className="flex items-center bg-secondary rounded-lg p-0.5">
          <button onClick={() => setGymMode(false)} className={cn("flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors touch-target", !gymMode ? "bg-primary text-primary-foreground" : "text-muted-foreground")} aria-pressed={!gymMode}>
            <Home className="w-3 h-3" /> Home
          </button>
          <button onClick={() => setGymMode(true)} className={cn("flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors touch-target", gymMode ? "bg-primary text-primary-foreground" : "text-muted-foreground")} aria-pressed={gymMode}>
            <Building2 className="w-3 h-3" /> Gym
          </button>
        </div>
      </div>

      <Button onClick={generateAIWorkout} disabled={generating} className="w-full touch-target btn-primary-gradient text-primary-foreground font-semibold">
        <Sparkles className="w-4 h-4 mr-2" /> {generating ? "Generating your workout..." : "Generate AI Workout"}
      </Button>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading workouts...</p>
      ) : workouts.length === 0 ? (
        <div className="bg-card rounded-xl p-8 border border-border text-center">
          <Dumbbell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No {gymMode ? "gym" : "home"} workouts yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Tap "Generate AI Workout" to create one tailored to your goals.</p>
        </div>
      ) : (
        workouts.map((w) => (
          <motion.div key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-foreground">{w.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{w.difficulty} • {w.duration_min} min • {w.exercises.length} exercises</p>
              </div>
            </div>
            {w.description && <p className="text-xs text-muted-foreground mb-3">{w.description}</p>}
            <Button onClick={() => startWorkout(w)} className="w-full touch-target btn-primary-gradient text-primary-foreground font-semibold">
              <Play className="w-4 h-4 mr-2" /> Start Workout
            </Button>
          </motion.div>
        ))
      )}
    </div>
  );
};

export default WorkoutScreen;
