import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

interface Meal {
  id: string;
  title: string;
  meal_type: string;
  country: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  cost_estimate: number | null;
  currency: string | null;
  ingredients: string[];
  instructions: string | null;
  image_url: string | null;
  dietary_tags: string[];
  is_published: boolean;
}

const emptyMeal = (): Partial<Meal> => ({
  title: "", meal_type: "lunch", country: "", calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0,
  cost_estimate: 0, currency: "USD", ingredients: [], instructions: "", dietary_tags: [], is_published: true,
});

const AdminMeals: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Meal> | null>(null);

  const load = async () => {
    const { data } = await supabase.from("meals").select("*").order("created_at", { ascending: false });
    setMeals((data as Meal[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.title) return toast.error("Title required");
    const payload: any = { ...editing };
    delete payload.id;
    if (typeof payload.ingredients === "string") payload.ingredients = payload.ingredients.split(",").map((s: string) => s.trim()).filter(Boolean);
    if (typeof payload.dietary_tags === "string") payload.dietary_tags = payload.dietary_tags.split(",").map((s: string) => s.trim()).filter(Boolean);
    const op = editing.id ? supabase.from("meals").update(payload).eq("id", editing.id) : supabase.from("meals").insert(payload);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false); setEditing(null); load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this meal?")) return;
    const { error } = await supabase.from("meals").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Meals</h1>
        <Button onClick={() => { setEditing(emptyMeal()); setOpen(true); }} className="btn-primary-gradient text-primary-foreground">
          <Plus className="w-4 h-4 mr-1" /> New Meal
        </Button>
      </div>

      {meals.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <UtensilsCrossed className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No meals yet.</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {meals.map((m) => (
          <div key={m.id} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-foreground">{m.title}</p>
                <p className="text-xs text-muted-foreground">{m.meal_type} • {m.country || "global"} • {m.calories} kcal</p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(m); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => del(m.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground flex gap-2">
              <span>P {m.protein_g}g</span><span>C {m.carbs_g}g</span><span>F {m.fat_g}g</span>
              {m.cost_estimate ? <span>• {m.currency} {m.cost_estimate}</span> : null}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} Meal</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Type</Label>
                  <Select value={editing.meal_type} onValueChange={(v) => setEditing({ ...editing, meal_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Country</Label><Input value={editing.country ?? ""} onChange={(e) => setEditing({ ...editing, country: e.target.value })} /></div>
                <div><Label>Calories</Label><Input type="number" value={editing.calories ?? 0} onChange={(e) => setEditing({ ...editing, calories: +e.target.value })} /></div>
                <div><Label>Cost</Label><Input type="number" step="0.01" value={editing.cost_estimate ?? 0} onChange={(e) => setEditing({ ...editing, cost_estimate: +e.target.value })} /></div>
                <div><Label>Protein (g)</Label><Input type="number" value={editing.protein_g ?? 0} onChange={(e) => setEditing({ ...editing, protein_g: +e.target.value })} /></div>
                <div><Label>Carbs (g)</Label><Input type="number" value={editing.carbs_g ?? 0} onChange={(e) => setEditing({ ...editing, carbs_g: +e.target.value })} /></div>
                <div><Label>Fat (g)</Label><Input type="number" value={editing.fat_g ?? 0} onChange={(e) => setEditing({ ...editing, fat_g: +e.target.value })} /></div>
                <div><Label>Currency</Label><Input value={editing.currency ?? "USD"} onChange={(e) => setEditing({ ...editing, currency: e.target.value })} /></div>
              </div>
              <div><Label>Ingredients (comma sep.)</Label><Textarea value={Array.isArray(editing.ingredients) ? editing.ingredients.join(", ") : (editing.ingredients as any) ?? ""} onChange={(e) => setEditing({ ...editing, ingredients: e.target.value as any })} /></div>
              <div><Label>Dietary tags (comma sep.)</Label><Input value={Array.isArray(editing.dietary_tags) ? editing.dietary_tags.join(", ") : (editing.dietary_tags as any) ?? ""} onChange={(e) => setEditing({ ...editing, dietary_tags: e.target.value as any })} placeholder="vegan, halal..." /></div>
              <div><Label>Instructions</Label><Textarea value={editing.instructions ?? ""} onChange={(e) => setEditing({ ...editing, instructions: e.target.value })} /></div>
              <div><Label>Image URL</Label><Input value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter><Button onClick={save} className="btn-primary-gradient text-primary-foreground">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMeals;
