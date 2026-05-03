/**
 * @file route.ts — POST /api/yatri
 * @description Yatri AI Chat API route powered by Google Gemini 2.5 Flash.
 *
 * Responsibilities:
 * - Validates the GEMINI_API_KEY at runtime (never baked into the build)
 * - Enforces per-IP rate limiting (20 requests / 60 seconds)
 * - Constructs a typed conversation history for multi-turn dialogue
 * - Calls the Gemini REST API with automatic retry and 15-second timeout
 * - Returns a structured JSON response with graceful fallback messages
 *
 * Security:
 * - API key is read from process.env at runtime only (injected via GCP Secret Manager)
 * - Rate limit map is in-process and resets per Cloud Run instance lifecycle
 * - All user input is capped at 1,000 characters before forwarding to Gemini
 *
 * @see https://ai.google.dev/gemini-api/docs
 */

import { NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────

/** A single message in the conversation history sent by the client. */
interface ChatHistoryMessage {
  role: "user" | "ai";
  text: string;
}

/** A single content entry in Gemini's expected conversation format. */
interface GeminiContentEntry {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

/** Shape of the parsed request body for POST /api/yatri. */
interface YatriRequestBody {
  message: string;
  history?: ChatHistoryMessage[];
  context?: string;
}

/** In-process rate limit state per IP address. */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────

/** In-memory store mapping IP addresses to their request counts and reset times. */
const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * Checks whether the given IP address is within the allowed request rate.
 * Allows up to 20 requests per 60-second window.
 *
 * @param ip - The client IP address extracted from request headers
 * @returns `true` if the request is allowed, `false` if the limit is exceeded
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= 20) return false;

  entry.count += 1;
  return true;
}

// ─── Gemini System Prompt ─────────────────────────────────────────────────────

/**
 * The system prompt that shapes Yatri's persona and knowledge boundaries.
 * Instructs Gemini to act as a friendly, non-partisan Indian election guide
 * using ECI-verified information sources.
 */
const SYSTEM_PROMPT = `You are Yatri, a friendly, knowledgeable, and helpful Election Assistant for Indian voters. You work for JagrukYatra — a civic education platform built for PromptWars × Google for Developers.

YOUR ROLE:
- Help Indian citizens understand the election process, their voting rights, and democratic responsibilities
- Answer questions about voter registration, EVM machines, Model Code of Conduct, NOTA, nomination process, campaigning rules, polling day procedures, vote counting, and government formation
- Guide users through the 8 official stages of the Indian election process as defined by ECI

YOUR PERSONALITY:
- Friendly, encouraging, and patient — like a knowledgeable elder brother or sister
- Use simple, clear language accessible to first-time voters and rural citizens
- Mix Hindi words naturally when helpful (e.g., "Jagruk Naagrik", "Yatra", "Matdan")
- Always be factual — cite ECI, Constitution, or Representation of People Act 1951 when relevant
- Keep answers concise but complete — ideally 2-4 paragraphs max
- Use emojis sparingly to make responses feel warm and approachable 🗳️

KNOWLEDGE BASE (Official ECI Sources):
1. Voter Registration: Form 6 at voters.eci.gov.in, 18+ years, Special Summary Revision Oct-Jan
2. Election Schedule: Announced 4-6 weeks before polling, MCC comes into force immediately
3. Nominations: 7-14 days window, ₹25,000 security deposit (General), affidavits at affidavit.eci.gov.in
4. Scrutiny: 1 day after nominations close, 2-day withdrawal window
5. Campaign: MCC active, 48-hour silence rule (Section 126 ROPA), cVIGIL app for violations
6. Polling: 7 AM – 6 PM, 12 alternate IDs accepted, VVPAT verification for 7 seconds
7. Counting: Typically 1-3 weeks after polling, 5 random VVPAT checks per constituency
8. Government Formation: Simple majority (272 Lok Sabha seats), President invites largest party

IMPORTANT RULES:
- Never make up facts — if unsure, say "I'd recommend checking eci.gov.in for the latest"
- Do not discuss specific political parties, candidates, or make partisan statements
- If asked about something non-election related, gently redirect to your election assistance role
- Support both Hindi and English questions — respond in the language the user writes in. If they write in Hindi, your response MUST be in Hindi.
- Always end with an encouragement or call to action when relevant`;

// ─── Constants ────────────────────────────────────────────────────────────────

/** Maximum number of Gemini API retry attempts before returning a fallback response. */
const MAX_RETRIES = 2;

/** Request timeout in milliseconds for each Gemini API call. */
const TIMEOUT_MS = 15_000;

/** Maximum character length for user messages to prevent abuse. */
const MAX_MESSAGE_LENGTH = 1_000;

/** Maximum character length for individual history message texts. */
const MAX_HISTORY_TEXT_LENGTH = 500;

/** Number of most-recent history turns to include in the Gemini context window. */
const MAX_HISTORY_TURNS = 8;

// ─── Route Handler ────────────────────────────────────────────────────────────

/**
 * Handles POST /api/yatri requests.
 * Validates input, enforces rate limiting, and proxies the request to Gemini.
 *
 * @param req - Incoming Next.js request containing { message, history, context }
 * @returns JSON response with `{ reply: string }` or an error shape
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 1. Rate Limiting ──────────────────────────────────────────────────────
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { reply: "You're sending too many messages. Please wait a minute before trying again. 🙏" },
      { status: 429 }
    );
  }

  try {
    // ── 2. API Key Validation ─────────────────────────────────────────────
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { reply: "Yatri AI is not configured. Please contact the administrator. 🗳️" },
        { status: 200 }
      );
    }

    // ── 3. Request Parsing & Validation ───────────────────────────────────
    const body = (await req.json()) as YatriRequestBody;
    const { message, history = [], context } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const safeMessage = String(message).slice(0, MAX_MESSAGE_LENGTH);

    // ── 4. Build Typed Conversation History ───────────────────────────────
    const chatContents: GeminiContentEntry[] = (Array.isArray(history) ? history : [])
      .slice(-MAX_HISTORY_TURNS)
      .map((msg: ChatHistoryMessage): GeminiContentEntry => ({
        role: msg.role === "ai" ? "model" : "user",
        parts: [{ text: String(msg.text).slice(0, MAX_HISTORY_TEXT_LENGTH) }],
      }));

    const finalUserMessage = context
      ? `[User is currently on: ${context}]\n\n${safeMessage}`
      : safeMessage;

    chatContents.push({
      role: "user",
      parts: [{ text: finalUserMessage }],
    });

    // ── 5. Gemini API Payload ─────────────────────────────────────────────
    const payload = {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: chatContents,
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.7,
        topP: 0.9,
      },
    };

    // ── 6. Fetch with Retry & Timeout ─────────────────────────────────────
    let attempt = 0;
    let response: Response | undefined;

    while (attempt <= MAX_RETRIES) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (response.ok) break;

        // Do not retry client errors (except 429 which is handled above)
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          const errorText = await response.text();
          throw new Error(`Client error ${response.status}: ${errorText}`);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          // Timeout — continue to retry
        } else if (err instanceof Error && err.message.startsWith("Client error")) {
          throw err; // Re-throw non-retryable errors
        }
      }

      attempt++;
      if (attempt <= MAX_RETRIES) {
        const delay = Math.pow(2, attempt - 1) * 1_000;
        await new Promise<void>((resolve) => setTimeout(resolve, delay));
      }
    }

    if (!response?.ok) {
      throw new Error(`Gemini API unavailable after ${MAX_RETRIES + 1} attempts`);
    }

    // ── 7. Parse Response ─────────────────────────────────────────────────
    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
        finishReason?: string;
      }>;
    };

    const candidate = data?.candidates?.[0];
    const replyText = candidate?.content?.parts?.[0]?.text;

    if (!replyText) {
      if (candidate?.finishReason === "MAX_TOKENS") {
        return NextResponse.json({
          reply: "Namaste! I had many thoughts on that but ran out of space. Could you ask a slightly more specific question? 🙏",
        });
      }
      throw new Error("Unexpected empty response from Gemini");
    }

    return NextResponse.json({ reply: replyText });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        reply:
          "Namaste! I'm currently experiencing high load. Please try again in 10–15 seconds. I'm here to help with anything about elections, voting, or your democratic rights! 🙏",
      },
      { status: 200 }
    );
  }
}
