import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { strings, targetLang } = await req.json(); // strings is an array or a single string
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
    }

    const isArray = Array.isArray(strings);
    const textToTranslate = isArray ? JSON.stringify(strings) : strings;

    const prompt = `You are a professional translator for JagrukYatra, an Indian election platform.
    Translate the following English ${isArray ? "JSON array of strings" : "text"} into ${targetLang === "hi" ? "Hindi" : targetLang}.
    
    Rules:
    - Keep the translation culturally relevant to India.
    - If it's a JSON array, return ONLY a valid JSON array of translated strings in the same order.
    - If it's plain text, return ONLY the translated text.
    - No explanations, no markdown blocks, just the raw translated content.

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

    const data = await response.json();
    let result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    
    // Improved JSON extraction
    if (isArray) {
      const jsonMatch = result.match(/\[.*\]/s);
      if (jsonMatch) {
        result = jsonMatch[0];
      }
    }

    const translated = isArray ? JSON.parse(result) : result;

    return NextResponse.json({ translated });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json({ error: "Failed to translate" }, { status: 500 });
  }
}
