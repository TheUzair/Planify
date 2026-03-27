import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const PROMPT_TEMPLATE = (title: string) =>
  `You are a productivity assistant for a task management app. Generate a concise, actionable task description (2-4 sentences) for the following task title: "${title}". Focus on what needs to be done, key steps, and any important considerations. Keep it practical, clear, and direct. Do not include bullet points or numbered lists.`;

// ── Provider: Gemini ────────────────────────────────────────────────────────

async function tryGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your-gemini-api-key-here") throw new Error("GEMINI_API_KEY not configured");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
  });

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ── Provider: Groq (Llama 3.3 70B) ─────────────────────────────────────────

async function tryGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not configured");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API ${res.status}: ${err}`);
  }

  const data = await res.json();
  return (data.choices?.[0]?.message?.content ?? "").trim();
}

// ── Route handler ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title } = body;

    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json(
        { error: "A task title with at least 3 characters is required" },
        { status: 400 }
      );
    }

    const prompt = PROMPT_TEMPLATE(title.trim());

    // Try Gemini first → fall back to Groq on any failure (rate limit, quota, etc.)
    let suggestion = "";
    let provider = "gemini";

    try {
      suggestion = await tryGemini(prompt);
    } catch (geminiErr) {
      console.warn("Gemini failed, falling back to Groq:", (geminiErr as Error).message);
      provider = "groq";
      suggestion = await tryGroq(prompt);
    }

    if (!suggestion) {
      return NextResponse.json(
        { error: "No suggestion was generated. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ suggestion, provider });
  } catch (error: unknown) {
    console.error("AI suggest error:", error);

    const errMsg = error instanceof Error ? error.message : "";
    if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("Too Many Requests")) {
      return NextResponse.json(
        { error: "AI rate limit reached. Please wait a minute and try again." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    return NextResponse.json({ error: "AI service temporarily unavailable. Please try again later." }, { status: 503 });
  }
}
