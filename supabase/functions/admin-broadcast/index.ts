// Admin-only: send a real in-app/push notification to a targeted audience.
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

    const body = await req.json().catch(() => ({}));
    const title = String(body.title ?? '').trim();
    const message = String(body.body ?? body.message ?? '').trim();
    const target = String(body.target ?? 'all');
    const country = body.country ? String(body.country).trim() : null;
    if (!title || title.length > 200) return j({ error: 'Title is required (max 200 chars)' }, 400);
    if (!message || message.length > 2000) return j({ error: 'Message is required (max 2000 chars)' }, 400);
    if (!['all', 'free', 'premium', 'country'].includes(target)) return j({ error: 'Invalid target' }, 400);
    if (target === 'country' && !country) return j({ error: 'Country is required for country targeting' }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    let q = admin.from('profiles').select('id');
    if (target === 'premium') q = q.eq('is_premium', true);
    if (target === 'free') q = q.eq('is_premium', false);
    if (target === 'country') q = q.ilike('country', country!);
    const { data: recipients, error } = await q;
    if (error) return j({ error: error.message }, 500);
    if (!recipients?.length) return j({ error: 'No users matched this audience' }, 400);

    const rows = recipients.map((r: any) => ({
      user_id: r.id, title, body: message, type: 'push', is_read: false,
    }));
    for (let i = 0; i < rows.length; i += 500) {
      const { error: insErr } = await admin.from('notifications').insert(rows.slice(i, i + 500));
      if (insErr) return j({ error: insErr.message }, 500);
    }

    return j({ sent: rows.length, target });
  } catch (e) {
    return j({ error: (e as Error).message }, 500);
  }
});
