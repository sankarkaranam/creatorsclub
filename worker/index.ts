/**
 * Cloudflare Worker for creatorsclub.co.in.
 * Static pages are served from ./dist (ASSETS); only /api/* reaches this code (see run_worker_first).
 * POST /api/contact stores contact-form messages in the D1 database bound as DB.
 */
interface Env {
  ASSETS: Fetcher;
  DB?: D1Database;
}

const ROLES = new Set(['creator', 'brand', 'other']);
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,24}$/i;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

async function handleContact(req: Request, env: Env): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const origin = req.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(req.url).host) return json({ error: 'forbidden' }, 403);
  if (Number(req.headers.get('content-length') ?? 0) > 16_000) return json({ error: 'too_large' }, 413);

  let data: Record<string, unknown>;
  try {
    data = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  // Honeypot: bots fill the hidden "website" field. Pretend success, store nothing.
  if (typeof data.website === 'string' && data.website.trim()) return json({ ok: true });

  const name = String(data.name ?? '').trim().slice(0, 120);
  const email = String(data.email ?? '').trim().slice(0, 200);
  const role = String(data.role ?? 'other');
  const message = String(data.message ?? '').trim().slice(0, 4000);
  if (!name || !EMAIL.test(email) || !ROLES.has(role) || message.length < 2) {
    return json({ error: 'invalid_input' }, 422);
  }
  if (!env.DB) return json({ error: 'not_configured' }, 503);

  const cf = (req as Request & { cf?: { country?: string } }).cf;
  await env.DB.prepare(
    `INSERT INTO contact_requests (name, email, role, message, country, user_agent) VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
  )
    .bind(name, email, role, message, cf?.country ?? null, (req.headers.get('user-agent') ?? '').slice(0, 300))
    .run();
  return json({ ok: true });
}

/**
 * creatorsclub.co.in now shows the team's public website (OrumindCreatorsClub/Frontend-public), which runs
 * on the production VM behind public.creatorsclub.co.in. This Worker forwards every request there, so the
 * main domain serves it without changing DNS. Set FORWARD_TO = '' to serve this repo's Astro site again.
 */
const FORWARD_TO = 'https://public.creatorsclub.co.in';

async function forward(req: Request): Promise<Response> {
  const incoming = new URL(req.url);
  const target = new URL(incoming.pathname + incoming.search, FORWARD_TO);
  const headers = new Headers(req.headers);
  headers.set('x-forwarded-host', incoming.host);
  headers.set('x-forwarded-proto', 'https');
  const res = await fetch(target.toString(), {
    method: req.method,
    headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body,
    redirect: 'manual',
  });
  // Keep visitors on the main domain if the origin redirects to its own hostname.
  const location = res.headers.get('location');
  if (location && location.startsWith(FORWARD_TO)) {
    const out = new Response(res.body, res);
    out.headers.set('location', `https://${incoming.host}${location.slice(FORWARD_TO.length)}`);
    return out;
  }
  return res;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (FORWARD_TO) return forward(req);
    const url = new URL(req.url);
    if (url.pathname === '/api/contact') return handleContact(req, env);
    if (url.pathname.startsWith('/api/')) return json({ error: 'not_found' }, 404);
    return env.ASSETS.fetch(req);
  },
} satisfies ExportedHandler<Env>;
