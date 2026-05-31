// Generates a personalized workout (with exercises) using Lovable AI and saves it for the user.
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

    const { environment = 'gym', focus = '', duration_min = 45 } = await req.json().catch(() => ({}));

    const { data: profile } = await userClient.from('profiles').select('*').eq('id', user.id).maybeSingle();

    const sys = `You design personalized workouts. Return ONLY JSON matching this schema:
{
  "title": string,
  "description": string,
  "difficulty": "beginner"|"intermediate"|"advanced",
  "duration_min": number,
  "environment": "gym"|"home"|"any",
  "goal": string,
  "exercises": [
    { "name": string, "sets": number, "reps": number, "rest_seconds": number,
      "muscles": string[], "form_tip": string, "youtube_query": string }
  ]
}
youtube_query MUST be a specific YouTube search like "barbell back squat proper form tutorial".
6-8 exercises. No prose, no markdown, JSON only.`;

    const userPrompt = `Build a ${duration_min}-minute ${environment} workout${focus ? ` focused on ${focus}` : ''} for:
goal=${profile?.goal ?? 'general fitness'}, country=${profile?.country ?? 'unknown'},
budget=${profile?.budget ?? 'unknown'}, dietary=${(profile?.dietary ?? []).join(', ') || 'none'}.
Tailor exercise selection and intensity accordingly.`;

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

    // Persist with service role (writes to public tables; admin-controlled fields)
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: workout, error: wErr } = await admin.from('workouts').insert({
      title: parsed.title ?? 'AI Workout',
      description: parsed.description ?? null,
      difficulty: parsed.difficulty ?? 'intermediate',
      duration_min: parsed.duration_min ?? duration_min,
      environment: parsed.environment ?? environment,
      goal: parsed.goal ?? profile?.goal ?? null,
      is_published: true,
    }).select().single();
    if (wErr) return j({ error: wErr.message }, 500);

    const exercises = (parsed.exercises ?? []).map((e: any, i: number) => ({
      workout_id: workout.id,
      name: e.name ?? `Exercise ${i + 1}`,
      sets: Number(e.sets) || 3,
      reps: Number(e.reps) || 10,
      rest_seconds: Number(e.rest_seconds) || 60,
      muscles: Array.isArray(e.muscles) ? e.muscles : [],
      form_tip: e.form_tip ?? null,
      youtube_query: e.youtube_query ?? `${e.name} exercise form`,
      position: i,
    }));
    if (exercises.length) {
      const { error: eErr } = await admin.from('exercises').insert(exercises);
      if (eErr) return j({ error: eErr.message }, 500);
    }

    return j({ workout_id: workout.id, workout, exercises });
  } catch (e) {
    return j({ error: (e as Error).message }, 500);
  }
});
