import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Dumbbell } from "lucide-react";
import { toast } from "sonner";

interface Workout {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
  duration_min: number;
  environment: string;
  goal: string | null;
  is_published: boolean;
}
interface Exercise {
  id: string;
  workout_id: string;
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

const emptyWorkout = (): Partial<Workout> => ({
  title: "", description: "", difficulty: "intermediate", duration_min: 30, environment: "gym", goal: "", is_published: true,
});
const emptyExercise = (workout_id: string, pos: number): Partial<Exercise> => ({
  workout_id, name: "", sets: 3, reps: 10, rest_seconds: 60, muscles: [], form_tip: "", video_url: "", youtube_query: "", position: pos,
});

const AdminWorkouts: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Record<string, Exercise[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [wDialog, setWDialog] = useState(false);
  const [editingW, setEditingW] = useState<Partial<Workout> | null>(null);
  const [exDialog, setExDialog] = useState(false);
  const [editingEx, setEditingEx] = useState<Partial<Exercise> | null>(null);

  const load = async () => {
    const { data } = await supabase.from("workouts").select("*").order("created_at", { ascending: false });
    setWorkouts((data as Workout[]) ?? []);
  };
  const loadExercises = async (workoutId: string) => {
    const { data } = await supabase.from("exercises").select("*").eq("workout_id", workoutId).order("position");
    setExercises((prev) => ({ ...prev, [workoutId]: (data as Exercise[]) ?? [] }));
  };

  useEffect(() => { load(); }, []);

  const saveWorkout = async () => {
    if (!editingW?.title) return toast.error("Title required");
    const payload = { ...editingW };
    delete (payload as any).id;
    const op = editingW.id
      ? supabase.from("workouts").update(payload).eq("id", editingW.id)
      : supabase.from("workouts").insert(payload as any);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setWDialog(false); setEditingW(null); load();
  };

  const deleteWorkout = async (id: string) => {
    if (!confirm("Delete this workout and all its exercises?")) return;
    const { error } = await supabase.from("workouts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const saveExercise = async () => {
    if (!editingEx?.name || !editingEx.workout_id) return toast.error("Name required");
    const payload: any = { ...editingEx };
    delete payload.id;
    if (typeof payload.muscles === "string") payload.muscles = payload.muscles.split(",").map((s: string) => s.trim()).filter(Boolean);
    const op = editingEx.id
      ? supabase.from("exercises").update(payload).eq("id", editingEx.id)
      : supabase.from("exercises").insert(payload);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setExDialog(false);
    if (editingEx.workout_id) loadExercises(editingEx.workout_id);
    setEditingEx(null);
  };

  const deleteExercise = async (ex: Exercise) => {
    if (!confirm("Delete this exercise?")) return;
    const { error } = await supabase.from("exercises").delete().eq("id", ex.id);
    if (error) return toast.error(error.message);
    loadExercises(ex.workout_id);
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Workouts</h1>
        <Button onClick={() => { setEditingW(emptyWorkout()); setWDialog(true); }} className="btn-primary-gradient text-primary-foreground">
          <Plus className="w-4 h-4 mr-1" /> New Workout
        </Button>
      </div>

      {workouts.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <Dumbbell className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No workouts yet. Create the first one.</p>
        </div>
      )}

      {workouts.map((w) => (
        <div key={w.id} className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => { const next = expanded === w.id ? null : w.id; setExpanded(next); if (next && !exercises[w.id]) loadExercises(w.id); }} className="flex-1 text-left flex items-center gap-2">
              {expanded === w.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <div>
                <p className="font-semibold text-foreground">{w.title}</p>
                <p className="text-xs text-muted-foreground">{w.environment} • {w.difficulty} • {w.duration_min} min {w.is_published ? "" : "• draft"}</p>
              </div>
            </button>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => { setEditingW(w); setWDialog(true); }}><Pencil className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => deleteWorkout(w.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </div>
          {expanded === w.id && (
            <div className="border-t border-border p-4 space-y-2">
              {(exercises[w.id] ?? []).map((ex) => (
                <div key={ex.id} className="bg-secondary rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{ex.position + 1}. {ex.name}</p>
                    <p className="text-xs text-muted-foreground">{ex.sets}×{ex.reps} • {ex.rest_seconds}s rest • {ex.muscles.join(", ")}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditingEx(ex); setExDialog(true); }}><Pencil className="w-3 h-3" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteExercise(ex)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                  </div>
                </div>
              ))}
              <Button size="sm" variant="outline" className="w-full" onClick={() => { setEditingEx(emptyExercise(w.id, (exercises[w.id]?.length ?? 0))); setExDialog(true); }}>
                <Plus className="w-3 h-3 mr-1" /> Add Exercise
              </Button>
            </div>
          )}
        </div>
      ))}

      {/* Workout dialog */}
      <Dialog open={wDialog} onOpenChange={setWDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingW?.id ? "Edit" : "New"} Workout</DialogTitle></DialogHeader>
          {editingW && (
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={editingW.title ?? ""} onChange={(e) => setEditingW({ ...editingW, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={editingW.description ?? ""} onChange={(e) => setEditingW({ ...editingW, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Environment</Label>
                  <Select value={editingW.environment} onValueChange={(v) => setEditingW({ ...editingW, environment: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="gym">Gym</SelectItem><SelectItem value="home">Home</SelectItem><SelectItem value="any">Any</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Difficulty</Label>
                  <Select value={editingW.difficulty} onValueChange={(v) => setEditingW({ ...editingW, difficulty: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="beginner">Beginner</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Duration (min)</Label><Input type="number" value={editingW.duration_min ?? 30} onChange={(e) => setEditingW({ ...editingW, duration_min: +e.target.value })} /></div>
                <div><Label>Goal</Label><Input value={editingW.goal ?? ""} onChange={(e) => setEditingW({ ...editingW, goal: e.target.value })} placeholder="e.g. bodybuilding" /></div>
              </div>
            </div>
          )}
          <DialogFooter><Button onClick={saveWorkout} className="btn-primary-gradient text-primary-foreground">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exercise dialog */}
      <Dialog open={exDialog} onOpenChange={setExDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingEx?.id ? "Edit" : "New"} Exercise</DialogTitle></DialogHeader>
          {editingEx && (
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={editingEx.name ?? ""} onChange={(e) => setEditingEx({ ...editingEx, name: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label>Sets</Label><Input type="number" value={editingEx.sets ?? 3} onChange={(e) => setEditingEx({ ...editingEx, sets: +e.target.value })} /></div>
                <div><Label>Reps</Label><Input type="number" value={editingEx.reps ?? 10} onChange={(e) => setEditingEx({ ...editingEx, reps: +e.target.value })} /></div>
                <div><Label>Rest (s)</Label><Input type="number" value={editingEx.rest_seconds ?? 60} onChange={(e) => setEditingEx({ ...editingEx, rest_seconds: +e.target.value })} /></div>
              </div>
              <div><Label>Muscles (comma separated)</Label><Input value={Array.isArray(editingEx.muscles) ? editingEx.muscles.join(", ") : (editingEx.muscles as any) ?? ""} onChange={(e) => setEditingEx({ ...editingEx, muscles: e.target.value as any })} /></div>
              <div><Label>Form tip</Label><Textarea value={editingEx.form_tip ?? ""} onChange={(e) => setEditingEx({ ...editingEx, form_tip: e.target.value })} /></div>
              <div><Label>YouTube URL or video ID</Label><Input value={editingEx.video_url ?? ""} onChange={(e) => setEditingEx({ ...editingEx, video_url: e.target.value })} placeholder="https://youtube.com/watch?v=..." /></div>
              <div><Label>YouTube search fallback</Label><Input value={editingEx.youtube_query ?? ""} onChange={(e) => setEditingEx({ ...editingEx, youtube_query: e.target.value })} placeholder="e.g. barbell bench press form" /></div>
              <div><Label>Position</Label><Input type="number" value={editingEx.position ?? 0} onChange={(e) => setEditingEx({ ...editingEx, position: +e.target.value })} /></div>
            </div>
          )}
          <DialogFooter><Button onClick={saveExercise} className="btn-primary-gradient text-primary-foreground">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWorkouts;
