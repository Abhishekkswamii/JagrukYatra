/**
 * @file route.ts — POST /api/translate
 * @description Dynamic translation API route powered by Google Gemini 2.5 Flash.
 *
 * Accepts either a plain string or a JSON array of strings and returns
 * the translation in the requested target language. The route is used by
 * LanguageContext to batch-translate UI strings into Hindi on demand,
 * enabling seamless bilingual (EN/HI) support without pre-compiled message files.
 *
 * Security:
 * - GEMINI_API_KEY is read from process.env at runtime only
 * - Low temperature (0.1) is used to maximise translation consistency
 *
 * @see https://ai.google.dev/gemini-api/docs
 */

import { NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Expected shape of the POST /api/translate request body. */
interface TranslateRequestBody {
  /** A single string or an array of strings to translate. */
  strings: string | string[];
  /** BCP-47 language code for the target language (e.g., "hi" for Hindi). */
  targetLang: string;
}

/** Shape of the Gemini REST API response we care about. */
interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

/**
 * Handles POST /api/translate requests.
 * Translates UI strings from English to the requested target language using Gemini.
 *
 * @param req - Next.js request containing `{ strings, targetLang }`
 * @returns JSON `{ translated: string | string[] }` or an error shape
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as TranslateRequestBody;
    const { strings, targetLang } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Translation service not configured" }, { status: 500 });
    }

    const isArray = Array.isArray(strings);
    const textToTranslate = isArray ? JSON.stringify(strings) : strings;
    const targetLanguage = targetLang === "hi" ? "Hindi" : targetLang;

    const prompt = `You are a professional translator for JagrukYatra, an Indian civic education platform.
Translate the following English ${isArray ? "JSON array of strings" : "text"} into ${targetLanguage}.

Rules:
- Keep the translation culturally relevant to India.
- If it is a JSON array, return ONLY a valid JSON array of translated strings in the same order.
- If it is plain text, return ONLY the translated text.
- No explanations, no markdown code blocks, no extra commentary — only the raw translated content.

Content: ${textToTranslate}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 },
        }),
      }
    );

    const data = (await response.json()) as GeminiResponse;
    let result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    // Extract only the JSON array portion if the model wrapped it in prose
    if (isArray) {
      const jsonMatch = result.match(/\[.*\]/s);
      if (jsonMatch) {
        result = jsonMatch[0];
      }
    }

    const translated: string | string[] = isArray ? (JSON.parse(result) as string[]) : result;

    return NextResponse.json({ translated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown translation error";
    console.error("[/api/translate] Error:", message);
    return NextResponse.json({ error: "Failed to translate content" }, { status: 500 });
  }
}
