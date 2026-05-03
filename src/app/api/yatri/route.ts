import { NextRequest, NextResponse } from "next/server";

/* ─────────────────────────────────────────────────────────────
   Yatri AI — Gemini 2.5 Flash REST API Route
   POST /api/yatri
   Body: { message: string, history: {role, text}[], context?: string }

   ✅ Uses direct REST API (fetch) instead of Google SDK per
      production requirements.
   ✅ GEMINI_API_KEY is read from process.env at RUNTIME only.
   ✅ Robust error logging, timeout, and retry logic included.
───────────────────────────────────────────────────────────── */

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

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

export async function POST(req: NextRequest) {
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
    /* 1. API KEY VALIDATION & LOGGING */
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("--- YATRI AI DEBUG LOG ---");
    if (!apiKey) {
      console.error("[Auth] GEMINI_API_KEY is undefined or empty!");
      return NextResponse.json(
        { reply: "Yatri AI is not configured. Missing GEMINI_API_KEY environment variable. 🗳️" },
        { status: 200 }
      );
    }
    
    // console.log(`[Auth] GEMINI_API_KEY loaded successfully...`);

    const { message, history = [], context } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const safeMessage = String(message).slice(0, 1000);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatContents: any[] = (Array.isArray(history) ? history : [])
      .slice(-8)
      .map((msg: { role: "user" | "ai"; text: string }) => ({
        role: msg.role === "ai" ? "model" : "user",
        parts: [{ text: String(msg.text).slice(0, 500) }],
      }));

    const finalUserMessage = context
      ? `[User is currently on: ${context}]\n\n${safeMessage}`
      : safeMessage;

    chatContents.push({
      role: "user",
      parts: [{ text: finalUserMessage }]
    });

    const payload = {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: chatContents,
      generationConfig: {
        maxOutputTokens: 4096, // Increased heavily because Gemini 2.5 Pro "thinking" consumes tokens
        temperature: 0.7,
        topP: 0.9,
      },
    };

    console.log("[Payload] Sending payload to Gemini API:", JSON.stringify({
      ...payload,
      systemInstruction: "<TRUNCATED_FOR_LOGS>",
      contents: `[Array of ${payload.contents.length} messages]`
    }));

    /* 2. ROBUST FETCH WITH RETRY & TIMEOUT */
    const MAX_RETRIES = 2;
    const TIMEOUT_MS = 15000; // 15 seconds timeout
    let attempt = 0;
    let response;
    let errorData = "";

    while (attempt <= MAX_RETRIES) {
      try {
        console.log(`[Fetch] Attempt ${attempt + 1}/${MAX_RETRIES + 1} using Gemini 2.5 Flash...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          console.log(`[Fetch] Success! Status: ${response.status}`);
          break; // Exit loop on success
        } else {
          errorData = await response.text();
          console.error(`[Fetch Error] Status: ${response.status} - Message: ${errorData}`);
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            // Client errors (400, 403, 404) shouldn't be retried
            throw new Error(`Client Error: ${response.status} - ${errorData}`);
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.error(`[Fetch] Request timed out after ${TIMEOUT_MS}ms`);
        } else {
          console.error(`[Fetch Exception] ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      attempt++;
      if (attempt <= MAX_RETRIES) {
        const delay = Math.pow(2, attempt - 1) * 1000; // attempt 1 -> 1s, attempt 2 -> 2s
        console.log(`[Retry] Waiting ${delay}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    if (!response || !response.ok) {
      throw new Error(`Failed to fetch from Gemini API after ${MAX_RETRIES + 1} attempts. Last status: ${response?.status}`);
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];
    const replyText = candidate?.content?.parts?.[0]?.text;

    if (!replyText) {
      console.error("[Response Error] Invalid response format from Gemini", JSON.stringify(data));
      
      // Handle MAX_TOKENS gracefully
      if (candidate?.finishReason === "MAX_TOKENS") {
        return NextResponse.json({ 
          reply: "Namaste! I had a lot of thoughts on that, but ran out of space to write them. Could you please ask a slightly more specific question? 🙏" 
        });
      }
      
      throw new Error("Invalid response format from Gemini");
    }

    return NextResponse.json({ reply: replyText });
  } catch (error: unknown) {
    console.error("--- YATRI AI FINAL ERROR ---");
    console.error(error instanceof Error ? error.message : String(error));
    
    // Professional, polite fallback message as requested
    return NextResponse.json(
      {
        reply:
          "Namaste! I'm currently experiencing high load from many users. Please try again in 10-15 seconds. I'm here to help you with anything about elections, voting, EVM, or your rights! 🙏",
      },
      { status: 200 }
    );
  }
}
