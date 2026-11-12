import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGIN = "https://littlemanpower.github.io";
const MAX_EMAIL = 200;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
};

function originAllowed(req: Request): boolean {
  return (req.headers.get("Origin") || "") === ALLOWED_ORIGIN;
}

function denyCors(): Response {
  return new Response(JSON.stringify({ error: "origin_not_allowed" }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const hits = new Map<string, number[]>();
function rateLimited(ip: string, limit: number, windowMs = 60_000): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    hits.set(ip, arr);
    return true;
  }
  arr.push(now);
  hits.set(ip, arr);
  return false;
}

function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";
}

function db() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

function normalizeEmail(value: unknown): string | null {
  const email = typeof value === "string" ? value.trim() : "";
  if (!email || email.length > MAX_EMAIL) return null;
  if (!EMAIL_RE.test(email)) return null;
  return email;
}

Deno.serve(async (req: Request) => {
  if (!originAllowed(req)) return denyCors();
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "not_found", message: "Send a POST request." }, 404);
  }

  const ip = clientIp(req);
  try {
    if (rateLimited(ip + ":subscribe", 5)) {
      return json({ error: "rate_limited", message: "Too many requests. Try again in a moment." }, 429);
    }

    const body = await req.json().catch(() => ({} as Record<string, unknown>));

    // Honeypot: bots that fill a hidden "company" field get a generic ok and nothing is stored.
    const honey = typeof body.company === "string" ? body.company.trim() : "";
    if (honey) {
      return json({ ok: true });
    }

    const email = normalizeEmail(body.email);
    if (!email) {
      return json({ error: "invalid_email", message: "Please enter a valid email address." }, 400);
    }
    if (body.consent !== true && body.consent !== "1" && body.consent !== "true") {
      return json({ error: "consent_required", message: "Please confirm you want email updates." }, 400);
    }

    const emailNorm = email.toLowerCase();
    const client = db();
    const { data: existing, error: lookupError } = await client
      .from("anna_subscribers")
      .select("id, unsubscribed_at")
      .eq("email_norm", emailNorm)
      .maybeSingle();
    if (lookupError) throw lookupError;

    if (existing) {
      // Dedupe: already on the list. Re-consent is left as an owner go-live decision.
      return json({ ok: true, deduped: true });
    }

    const { error } = await client.from("anna_subscribers").insert({
      email,
      consented_at: new Date().toISOString(),
    });
    if (error) {
      // Unique race: treat as a dedupe success.
      if ((error as { code?: string }).code === "23505") {
        return json({ ok: true, deduped: true });
      }
      throw error;
    }
    return json({ ok: true });
  } catch (_e) {
    return json({ error: "server_error", message: "Something went wrong. Try again in a moment." }, 500);
  }
});
