// Generates an adaptive workout + weekly meal plan for the signed-in user.
// Inputs: optional { adapt: boolean } — when true, pulls recent sessions+metrics to adapt.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const j = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  try {
    if (!LOVABLE_API_KEY) return j({ error: 'LOVABLE_API_KEY missing' }, 500);
    const auth = req.headers.get('Authorization');
    if (!auth) return j({ error: 'Unauthorized' }, 401);

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: auth } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return j({ error: 'Unauthorized' }, 401);

    const { adapt = false } = await req.json().catch(() => ({}));


    const [{ data: profile }, { data: sessions }, { data: metrics }] = await Promise.all([
      userClient.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      userClient.from('workout_sessions').select('*').eq('user_id', user.id).order('started_at', { ascending: false }).limit(10),
      userClient.from('body_metrics').select('*').eq('user_id', user.id).order('recorded_at', { ascending: false }).limit(5),
    ]);

    const perfSummary = adapt && sessions?.length
      ? `Recent sessions: ${sessions.length} completed. Avg duration ${
          Math.round(sessions.reduce((s, x: any) => s + (x.duration_seconds || 0), 0) / sessions.length / 60)
        } min. Difficulty feedback: ${sessions.map((s: any) => s.perceived_difficulty).filter(Boolean).join(', ') || 'none'}.`
      : 'No prior sessions — start with a calibration week.';
    const bodySummary = metrics?.length
      ? `Latest weight: ${metrics[0].weight_kg ?? 'n/a'}kg, body fat: ${metrics[0].body_fat_pct ?? 'n/a'}%.`
      : 'No body metrics logged yet.';

    const sys = `You are an adaptive fitness & nutrition coach. Return ONLY JSON:
{
  "workout": {
    "title": string, "description": string, "difficulty": "beginner"|"intermediate"|"advanced",
    "duration_min": number, "environment": "gym"|"home"|"any", "goal": string,
    "exercises": [{ "name": string, "sets": number, "reps": number, "rest_seconds": number,
                    "muscles": string[], "form_tip": string, "youtube_query": string }]
  },
  "meal_plan": {
    "notes": string,
    "days": [ { "day": "Mon"|"Tue"|"Wed"|"Thu"|"Fri"|"Sat"|"Sun",
                "meals": [ { "type": "breakfast"|"lunch"|"dinner"|"snack",
                             "title": string, "calories": number, "protein_g": number,
                             "carbs_g": number, "fat_g": number,
                             "ingredients": string[], "cost_estimate": number, "currency": string } ] } ]
  }
}
Rules:
- 6-8 exercises matched to goal & environment.
- 7 days, ${profile?.budget ? `keep daily cost within ${profile.budget} ${'USD'}` : 'reasonable budget'}.
- Respect dietary restrictions. Use foods commonly available in user's country.
- youtube_query specific like "barbell back squat proper form tutorial".
- ${adapt ? 'ADAPT intensity & volume based on perceived difficulty and progress.' : 'Use a calibration baseline.'}
JSON only, no prose.`;

    const userPrompt = `User profile:
goal=${profile?.goal ?? 'general'}, country=${profile?.country ?? 'unknown'},
budget/day=${profile?.budget ?? 'unknown'}, dietary=${(profile?.dietary ?? []).join(', ') || 'none'}.
${perfSummary}
${bodySummary}
${foodResearch ? `Local food research for ${profile?.country} (use these real, locally available & affordable foods):\n${foodResearch}` : ''}`;


    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: sys }, { role: 'user', content: userPrompt }],
      }),
    });
    if (!aiRes.ok) {
      const t = await aiRes.text();
      if (aiRes.status === 429) return j({ error: 'Rate limit reached, try again shortly.' }, 429);
      if (aiRes.status === 402) return j({ error: 'AI credits exhausted.' }, 402);
      return j({ error: t }, aiRes.status);
    }
    const data = await aiRes.json();
    const content = data?.choices?.[0]?.message?.content ?? '{}';
    let parsed: any;
    try { parsed = JSON.parse(content); } catch { return j({ error: 'AI returned invalid JSON', raw: content }, 500); }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Persist workout
    const w = parsed.workout ?? {};
    const { data: workout, error: wErr } = await admin.from('workouts').insert({
      title: w.title ?? 'Adaptive Workout',
      description: w.description ?? null,
      difficulty: w.difficulty ?? 'intermediate',
      duration_min: w.duration_min ?? 45,
      environment: w.environment ?? 'any',
      goal: w.goal ?? profile?.goal ?? null,
      is_published: true,
    }).select().single();
    if (wErr) return j({ error: wErr.message }, 500);

    const exercises = (w.exercises ?? []).map((e: any, i: number) => ({
      workout_id: workout.id,
      name: e.name ?? `Exercise ${i + 1}`,
      sets: Number(e.sets) || 3,
      reps: Number(e.reps) || 10,
      rest_seconds: Number(e.rest_seconds) || 60,
      muscles: Array.isArray(e.muscles) ? e.muscles : [],
      form_tip: e.form_tip ?? null,
      youtube_query: e.youtube_query ?? `${e.name} form`,
      position: i,
    }));
    if (exercises.length) await admin.from('exercises').insert(exercises);

    // Persist meal plan (user-scoped)
    const mp = parsed.meal_plan ?? { days: [] };
    const { data: plan, error: mErr } = await admin.from('meal_plans').insert({
      user_id: user.id,
      week_start: new Date().toISOString().slice(0, 10),
      days: mp.days ?? [],
      notes: mp.notes ?? null,
      source: adapt ? 'ai-adapt' : 'ai-initial',
    }).select().single();
    if (mErr) return j({ error: mErr.message }, 500);

    return j({ workout_id: workout.id, meal_plan_id: plan.id, adapted: adapt });
  } catch (e) {
    return j({ error: (e as Error).message }, 500);
  }
});
