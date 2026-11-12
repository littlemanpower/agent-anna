import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGIN = "https://littlemanpower.github.io";
const MAX_NAME = 80;
const MAX_CONTACT = 200;
const MAX_BODY = 1000;

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

function cleanOptional(value: unknown, max: number): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return null;
  return text.slice(0, max);
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
    if (rateLimited(ip + ":message", 8)) {
      return json({ error: "rate_limited", message: "Too many requests. Try again in a moment." }, 429);
    }

    const body = await req.json().catch(() => ({} as Record<string, unknown>));

    // Honeypot: bots that fill a hidden "company" field get a fake success and nothing is stored.
    const honey = typeof body.company === "string" ? body.company.trim() : "";
    if (honey) {
      return json({ ok: true });
    }

    const visitorName = cleanOptional(body.name, MAX_NAME);
    const visitorContact = cleanOptional(body.contact, MAX_CONTACT);
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) {
      return json({ error: "invalid_body", message: "Please write a message for Anna." }, 400);
    }
    if (message.length > MAX_BODY) {
      return json({ error: "invalid_body", message: `Message is too long (max ${MAX_BODY} characters).` }, 400);
    }

    const { error } = await db().from("anna_messages").insert({
      visitor_name: visitorName,
      visitor_contact: visitorContact,
      body: message,
    });
    if (error) throw error;
    return json({ ok: true });
  } catch (_e) {
    return json({ error: "server_error", message: "Something went wrong. Try again in a moment." }, 500);
  }
});
