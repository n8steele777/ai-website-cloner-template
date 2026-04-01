import { NextResponse } from "next/server";
import { Resend } from "resend";
import { checkContactRateLimit } from "@/lib/contact-rate-limit";
import { STUDIO_CONTACT_EMAIL } from "@/lib/studio-contact";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_JSON_BYTES = 196_608;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

type BoundedResult =
  | { ok: true; value: string }
  | { ok: false; kind: "missing" | "too_long" | "invalid" };

function boundedTrimmedField(value: unknown, max: number, required: boolean): BoundedResult {
  if (typeof value !== "string") {
    return required ? { ok: false, kind: "invalid" } : { ok: true, value: "" };
  }
  const t = value.trim();
  if (t.length > max) {
    return { ok: false, kind: "too_long" };
  }
  if (required && t.length === 0) {
    return { ok: false, kind: "missing" };
  }
  return { ok: true, value: t };
}

function sanitizeOneLineHeader(value: string, max: number): string {
  return Array.from(value)
    .filter((ch) => ch !== "\r" && ch !== "\n")
    .join("")
    .trim()
    .slice(0, max);
}

export async function POST(request: Request) {
  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    const n = Number.parseInt(contentLength, 10);
    if (!Number.isNaN(n) && n > MAX_JSON_BYTES) {
      return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
    }
  }

  const rate = await checkContactRateLimit(request);
  if (!rate.ok) {
    return NextResponse.json(
      {
        error: "Too many submissions from this address. Please try again later.",
        retryAfterSec: rate.retryAfterSec,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSec) },
      },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!isRecord(raw)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof raw.website === "string" && raw.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const nameField = boundedTrimmedField(raw.name, 120, true);
  if (!nameField.ok) {
    if (nameField.kind === "too_long") {
      return NextResponse.json({ error: "Name is too long." }, { status: 400 });
    }
    return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  }
  const name = nameField.value;

  const emailField = boundedTrimmedField(raw.email, 254, true);
  if (!emailField.ok) {
    if (emailField.kind === "too_long") {
      return NextResponse.json({ error: "Email is too long." }, { status: 400 });
    }
    if (emailField.kind === "missing") {
      return NextResponse.json({ error: "Enter your email address." }, { status: 400 });
    }
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }
  const email = emailField.value;

  const messageField = boundedTrimmedField(raw.message, 8000, true);
  if (!messageField.ok) {
    if (messageField.kind === "too_long") {
      return NextResponse.json({ error: "Message is too long." }, { status: 400 });
    }
    if (messageField.kind === "missing") {
      return NextResponse.json({ error: "Please enter a message." }, { status: 400 });
    }
    return NextResponse.json({ error: "Please enter a message." }, { status: 400 });
  }
  const message = messageField.value;

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  if (message.length < 10) {
    return NextResponse.json(
      { error: "Message must be at least 10 characters." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL?.trim();
  const to = (process.env.CONTACT_TO_EMAIL ?? STUDIO_CONTACT_EMAIL).trim();

  if (!apiKey || !from) {
    console.error("[contact] Missing RESEND_API_KEY or CONTACT_FROM_EMAIL");
    return NextResponse.json(
      { error: "Contact form is not configured yet." },
      { status: 503 },
    );
  }

  const resend = new Resend(apiKey);
  const subjectLine = `Site inquiry from ${sanitizeOneLineHeader(name, 120)}`;

  const textBody = [`Name: ${name}`, `Email: ${email}`, "", message].join("\n");

  const replyTo = `${name.replace(/[<>"\\]/g, "").slice(0, 80)} <${email}>`;

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo,
    subject: subjectLine,
    text: textBody,
  });

  if (error) {
    console.error("[contact] Resend error:", error);
    return NextResponse.json(
      { error: "Could not send your message. Please try again in a moment." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
