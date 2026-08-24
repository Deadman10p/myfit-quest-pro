import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AdminStats {
  totals: Record<string, number>;
  dailyActive: { day: string; users: number }[];
  growth: { month: string; users: number }[];
  countries: { name: string; value: number }[];
  goals: { name: string; value: number }[];
  difficulty: { name: string; value: number }[];
  users: {
    id: string; name: string | null; country: string | null; goal: string | null;
    is_premium: boolean; onboarded: boolean; xp: number; streak: number;
    created_at: string; sessions: number; last_active: string | null;
  }[];
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.functions.invoke("admin-stats", { body: {} });
      if (cancelled) return;
      if (error) setError(error.message);
      else if ((data as any)?.error) setError((data as any).error);
      else setStats(data as AdminStats);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return { stats, loading, error };
};
