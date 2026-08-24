// Admin-only aggregated analytics. Uses service role after verifying the caller is an admin.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const j = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  try {
    const auth = req.headers.get('Authorization');
    if (!auth) return j({ error: 'Unauthorized' }, 401);
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return j({ error: 'Unauthorized' }, 401);
    const { data: isAdmin } = await userClient.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    if (!isAdmin) return j({ error: 'Forbidden' }, 403);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const [profilesRes, sessionsRes, plansRes, metricsRes, feedbackRes, gymsRes, workoutsRes, mealsRes] = await Promise.all([
      admin.from('profiles').select('id, created_at, country, goal, is_premium, onboarded, xp, streak, display_name'),
      admin.from('workout_sessions').select('user_id, started_at, completed_at, duration_seconds, perceived_difficulty, xp_earned'),
      admin.from('meal_plans').select('id, user_id, created_at, source'),
      admin.from('body_metrics').select('user_id, recorded_at, weight_kg'),
      admin.from('feedback').select('id, status, created_at'),
      admin.from('gyms').select('id'),
      admin.from('workouts').select('id, created_at'),
      admin.from('meals').select('id'),
    ]);

    const profiles = profilesRes.data ?? [];
    const sessions = sessionsRes.data ?? [];
    const plans = plansRes.data ?? [];
    const metrics = metricsRes.data ?? [];

    const now = Date.now();
    const dayMs = 86400000;
    const since = (d: number) => new Date(now - d * dayMs);

    const completed = sessions.filter((s: any) => s.completed_at);
    const activeIds = (days: number) =>
      new Set(sessions.filter((s: any) => new Date(s.started_at) >= since(days)).map((s: any) => s.user_id));

    // Daily active users, last 7 days
    const dailyActive: { day: string; users: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now - i * dayMs); start.setUTCHours(0, 0, 0, 0);
      const end = new Date(start.getTime() + dayMs);
      const set = new Set(sessions.filter((s: any) => {
        const t = new Date(s.started_at);
        return t >= start && t < end;
      }).map((s: any) => s.user_id));
      dailyActive.push({ day: start.toUTCString().slice(0, 3), users: set.size });
    }

    // Signups by month (last 6 months, cumulative)
    const growth: { month: string; users: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - i + 1, 1));
      const label = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1))
        .toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
      growth.push({ month: label, users: profiles.filter((p: any) => new Date(p.created_at) < d).length });
    }

    const countBy = (arr: any[], key: string) => {
      const m = new Map<string, number>();
      for (const x of arr) {
        const k = (x[key] ?? 'Unknown') || 'Unknown';
        m.set(k, (m.get(k) ?? 0) + 1);
      }
      return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    };

    const premium = profiles.filter((p: any) => p.is_premium).length;
    const avgSessionMin = completed.length
      ? Math.round(completed.reduce((s: number, x: any) => s + (x.duration_seconds || 0), 0) / completed.length / 60)
      : 0;

    return j({
      totals: {
        users: profiles.length,
        onboarded: profiles.filter((p: any) => p.onboarded).length,
        premium,
        free: profiles.length - premium,
        activeToday: activeIds(1).size,
        active7d: activeIds(7).size,
        active30d: activeIds(30).size,
        sessionsStarted: sessions.length,
        sessionsCompleted: completed.length,
        completionRate: sessions.length ? Math.round((completed.length / sessions.length) * 100) : 0,
        onboardingRate: profiles.length ? Math.round((profiles.filter((p: any) => p.onboarded).length / profiles.length) * 100) : 0,
        avgSessionMin,
        mealPlans: plans.length,
        metricsLogged: metrics.length,
        openFeedback: (feedbackRes.data ?? []).filter((f: any) => f.status === 'new').length,
        gyms: (gymsRes.data ?? []).length,
        workouts: (workoutsRes.data ?? []).length,
        meals: (mealsRes.data ?? []).length,
        totalXp: profiles.reduce((s: number, p: any) => s + (p.xp || 0), 0),
      },
      dailyActive,
      growth,
      countries: countBy(profiles, 'country').slice(0, 6),
      goals: countBy(profiles, 'goal').slice(0, 6),
      difficulty: countBy(completed, 'perceived_difficulty'),
      users: profiles
        .map((p: any) => ({
          id: p.id,
          name: p.display_name,
          country: p.country,
          goal: p.goal,
          is_premium: p.is_premium,
          onboarded: p.onboarded,
          xp: p.xp,
          streak: p.streak,
          created_at: p.created_at,
          sessions: sessions.filter((s: any) => s.user_id === p.id).length,
          last_active: sessions.filter((s: any) => s.user_id === p.id)
            .map((s: any) => s.started_at).sort().pop() ?? null,
        }))
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    });
  } catch (e) {
    return j({ error: (e as Error).message }, 500);
  }
});
