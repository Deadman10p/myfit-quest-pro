import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, X, MessageCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const meals = [
  {
    type: "Breakfast", time: "7:30 AM",
    name: "Protein Oatmeal Bowl",
    ingredients: ["Oats (60g)", "Whey protein (30g)", "Banana (1)", "Almond butter (15g)", "Chia seeds (10g)"],
    prep: "10 min", calories: 520, protein: 38, carbs: 62, fat: 16, cost: "$4.50",
  },
  {
    type: "Lunch", time: "12:30 PM",
    name: "Grilled Chicken & Rice",
    ingredients: ["Chicken breast (200g)", "Brown rice (150g)", "Broccoli (100g)", "Olive oil (10ml)", "Lemon juice"],
    prep: "25 min", calories: 650, protein: 52, carbs: 65, fat: 14, cost: "$6.00",
  },
  {
    type: "Dinner", time: "7:00 PM",
    name: "Salmon with Sweet Potato",
    ingredients: ["Salmon fillet (180g)", "Sweet potato (200g)", "Asparagus (100g)", "Garlic (2 cloves)", "Herbs"],
    prep: "30 min", calories: 580, protein: 42, carbs: 48, fat: 22, cost: "$8.50",
  },
  {
    type: "Snack", time: "3:30 PM",
    name: "Greek Yogurt & Nuts",
    ingredients: ["Greek yogurt (200g)", "Mixed nuts (30g)", "Honey (10g)"],
    prep: "2 min", calories: 350, protein: 22, carbs: 28, fat: 18, cost: "$3.00",
  },
];

const NutritionScreen: React.FC = () => {
  const [view, setView] = useState<"daily" | "weekly">("daily");
  const [eaten, setEaten] = useState<Record<number, boolean>>({});

  const totalCal = meals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = meals.reduce((s, m) => s + m.protein, 0);

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Nutrition</h2>
        <div className="flex items-center bg-secondary rounded-lg p-0.5">
          <button onClick={() => setView("daily")} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors touch-target", view === "daily" ? "bg-primary text-primary-foreground" : "text-muted-foreground")} aria-pressed={view === "daily"}>Today</button>
          <button onClick={() => setView("weekly")} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors touch-target", view === "weekly" ? "bg-primary text-primary-foreground" : "text-muted-foreground")} aria-pressed={view === "weekly"}>Week</button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><p className="text-lg font-bold text-foreground">{totalCal}</p><p className="text-[10px] text-muted-foreground">Calories</p></div>
          <div><p className="text-lg font-bold text-primary">{totalProtein}g</p><p className="text-[10px] text-muted-foreground">Protein</p></div>
          <div><p className="text-lg font-bold text-foreground">${"22.00"}</p><p className="text-[10px] text-muted-foreground">Est. Cost</p></div>
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-3">
        {meals.map((meal, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={cn("bg-card rounded-xl p-4 border transition-colors", eaten[i] ? "border-primary/30 opacity-75" : "border-border")}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-[10px] font-semibold text-primary uppercase">{meal.type} • {meal.time}</span>
                <h3 className="text-sm font-semibold text-foreground mt-0.5">{meal.name}</h3>
              </div>
              <span className="text-xs text-muted-foreground">{meal.prep}</span>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {meal.ingredients.map((ing, j) => (
                <span key={j} className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground">{ing}</span>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-2 text-center mb-3">
              <div><p className="text-xs font-medium text-foreground">{meal.calories}</p><p className="text-[10px] text-muted-foreground">cal</p></div>
              <div><p className="text-xs font-medium text-foreground">{meal.protein}g</p><p className="text-[10px] text-muted-foreground">protein</p></div>
              <div><p className="text-xs font-medium text-foreground">{meal.carbs}g</p><p className="text-[10px] text-muted-foreground">carbs</p></div>
              <div><p className="text-xs font-medium text-foreground">{meal.fat}g</p><p className="text-[10px] text-muted-foreground">fat</p></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">~{meal.cost}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs touch-target" aria-label="Chat about this meal">
                  <MessageCircle className="w-3 h-3 mr-1" /> Alternatives
                </Button>
                <Button size="sm" onClick={() => setEaten({ ...eaten, [i]: !eaten[i] })}
                  className={cn("text-xs touch-target", eaten[i] ? "bg-primary/20 text-primary hover:bg-primary/30" : "btn-primary-gradient text-primary-foreground")}
                  aria-label={eaten[i] ? "Mark as not eaten" : "Mark as eaten"}>
                  {eaten[i] ? <><Check className="w-3 h-3 mr-1" /> Eaten</> : "Mark Eaten"}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default NutritionScreen;
