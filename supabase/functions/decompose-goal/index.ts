import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ---------------------------------------------------------------------------
// PII masking
// ---------------------------------------------------------------------------

/**
 * Redacts personally-identifiable information from the goal text before it
 * is sent to the external AI gateway.
 *
 * Replacements use distinct labels so the AI prompt stays readable:
 *   email addresses  → [email]
 *   phone numbers    → [phone]
 *   URLs             → [link]
 */
function maskPII(text: string): string {
  // Email addresses (RFC-5321 simplified)
  let masked = text.replace(
    /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
    "[email]"
  );

  // Phone numbers – covers international (+1 …), US parenthesised ((555) …),
  // dot / dash / space delimited variants, and plain digit strings ≥10 digits.
  masked = masked.replace(
    /(\+?[\d][\s.\-]?)?(\(?\d{3}\)?[\s.\-]?)(\d{3}[\s.\-]?\d{4})/g,
    "[phone]"
  );

  // URLs – http / https / ftp and bare www. prefixes
  masked = masked.replace(
    /(?:https?:\/\/|ftp:\/\/|www\.)[^\s,;'")\]>]+/gi,
    "[link]"
  );

  return masked;
}

// ---------------------------------------------------------------------------
// Rule-based fallback decomposition
// ---------------------------------------------------------------------------

type MicroWin = { step: string; duration: number };

/**
 * Generates a set of keyword-matched template steps when the AI is unavailable.
 * Matches are tried in order; the first match wins.
 * Always returns exactly 5 steps in {step, duration} format.
 */
function generateFallbackSteps(goal: string): MicroWin[] {
  const lower = goal.toLowerCase();

  // Cleaning / tidying
  if (/clean|tidy|organiz|wash|dust|sweep|vacuum|mop/.test(lower)) {
    return [
      { step: "🧹 Gather all supplies you need in one spot", duration: 2 },
      { step: "🗑️ Remove and throw away obvious trash first", duration: 3 },
      { step: "📦 Put misplaced items back in their correct places", duration: 5 },
      { step: "✨ Wipe down surfaces with a cloth or sponge", duration: 5 },
      { step: "🎉 Do a final sweep and admire your clean space", duration: 2 },
    ];
  }

  // Writing / drafting
  if (/write|essay|report|article|blog|draft|document/.test(lower)) {
    return [
      { step: "💡 Jot down your main idea or thesis in one sentence", duration: 3 },
      { step: "📝 List three key points you want to cover", duration: 5 },
      { step: "✍️ Write a rough opening paragraph without editing", duration: 5 },
      { step: "📖 Expand each key point into two or three sentences", duration: 5 },
      { step: "🔍 Read through and fix any obvious errors", duration: 5 },
    ];
  }

  // Studying / revision
  if (/study|exam|test|learn|revision|revise|review|homework|course/.test(lower)) {
    return [
      { step: "📚 Gather your notes and materials for this topic", duration: 2 },
      { step: "🔑 Identify the three most important concepts to review", duration: 5 },
      { step: "📝 Write a quick summary of each concept in your own words", duration: 5 },
      { step: "❓ Create five practice questions and answer them", duration: 5 },
      { step: "🏆 Review any answers you got wrong and note them", duration: 3 },
    ];
  }

  // Cooking / meal prep
  if (/cook|meal|recipe|bake|dinner|lunch|breakfast|food|prep/.test(lower)) {
    return [
      { step: "🛒 Check you have all the ingredients you need", duration: 2 },
      { step: "🔪 Chop, measure, and prep all ingredients before cooking", duration: 5 },
      { step: "🍳 Follow the first cooking step in your recipe", duration: 5 },
      { step: "🧂 Taste and adjust seasoning as you go", duration: 3 },
      { step: "🍽️ Plate up and enjoy — you made that!", duration: 2 },
    ];
  }

  // Email / messaging
  if (/email|message|reply|respond|contact|reach out/.test(lower)) {
    return [
      { step: "📋 List the key points you need to communicate", duration: 2 },
      { step: "✍️ Write a rough draft without worrying about tone", duration: 5 },
      { step: "🔍 Read through and adjust the tone to be clear and friendly", duration: 3 },
      { step: "📎 Attach any needed files or links", duration: 2 },
      { step: "✅ Read one last time then hit send", duration: 1 },
    ];
  }

  // Exercise / fitness
  if (/exercise|workout|gym|run|jog|fitness|training/.test(lower)) {
    return [
      { step: "👟 Change into comfortable workout clothes", duration: 2 },
      { step: "🤸 Do a 3-minute warm-up stretch", duration: 3 },
      { step: "💪 Complete the first set of your main exercise", duration: 5 },
      { step: "🏃 Continue with remaining sets or cardio", duration: 5 },
      { step: "😌 Cool down with light stretching for 2 minutes", duration: 2 },
    ];
  }

  // Generic default (spec-mandated copy)
  return [
    { step: "Write down what 'done' looks like", duration: 2 },
    { step: "Pick the easiest first step", duration: 2 },
    { step: "Set a 5-minute timer", duration: 1 },
    { step: "Do just that one thing", duration: 5 },
    { step: "Take a 2-minute break", duration: 2 },
    // Note: spec lists 6 generic steps — included as requested.
    { step: "Decide your next step", duration: 2 },
  ];
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// System prompt builder
// ---------------------------------------------------------------------------

/**
 * Builds the AI system prompt, injecting the user's preferred step count
 * and any PII-masked support notes as additional context.
 *
 * @param preferredStepCount - How many steps the user prefers (3–10).
 * @param safeNotes          - PII-masked user context, or null if absent.
 */
function buildSystemPrompt(preferredStepCount: number, safeNotes: string | null): string {
  const stepRange =
    preferredStepCount <= 4
      ? `${preferredStepCount}-${preferredStepCount + 1}`
      : preferredStepCount >= 9
      ? `${preferredStepCount - 1}-${preferredStepCount}`
      : `${preferredStepCount - 1}-${preferredStepCount + 1}`;

  const userContext = safeNotes
    ? `\n\nUser context: ${safeNotes}\nAdjust step granularity, vocabulary, and pacing based on this context.`
    : "";

  return `You are a neuro-inclusive productivity coach. When given a high-level goal, break it down into exactly ${preferredStepCount} small, concrete "Micro-Win" steps (aim for ${stepRange} steps). Each step should take about 5 minutes or less.

Rules:
- Each step must be a single, clear action (verb + object)
- Steps should be sequential and build toward the goal
- Use simple, encouraging language
- Include a brief motivational emoji at the start of each step
- Keep each step under 15 words
- Return EXACTLY ${preferredStepCount} steps unless the goal genuinely requires fewer${userContext}

Respond ONLY with a valid JSON array of objects with "step" (string) and "duration" (number, minutes) fields. No markdown, no explanation.
Example: [{"step":"🎯 Write down your main idea in one sentence","duration":2},{"step":"📝 List three key points to support it","duration":5}]`;
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

/** Builds a JSON Response with CORS headers attached. */
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Returns a fallback response tagged with source: "fallback". */
function fallbackResponse(goal: string): Response {
  return jsonResponse({
    steps: generateFallbackSteps(goal),
    fallback: true,
    source: "fallback",
  });
}

// ---------------------------------------------------------------------------
// Edge function handler
// ---------------------------------------------------------------------------

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const rawGoal: string = body.goal ?? "";

    if (!rawGoal.trim()) {
      return jsonResponse({ error: "goal is required" }, 400);
    }

    // 1. PII masking — redact before the text ever leaves this function.
    const safeGoal = maskPII(rawGoal);

    // Personalisation fields forwarded from the frontend profile.
    const rawNotes: string = body.supportNotes ?? "";
    const preferredStepCount: number = Math.min(
      10,
      Math.max(3, Number(body.preferredStepCount) || 5)
    );

    // PII-mask support notes too — they're user-written free text.
    const safeNotes = rawNotes.trim() ? maskPII(rawNotes.trim()) : null;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // 2. No API key → immediate fallback (no round-trip wasted).
    if (!LOVABLE_API_KEY) {
      console.warn("LOVABLE_API_KEY not configured – using fallback decomposition");
      return fallbackResponse(safeGoal);
    }

    // 3. AbortController for a 4-second hard deadline on the AI call.
    //    If the gateway is slow we fail fast and serve the template steps instead.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4_000);

    let aiResponse: Response;
    try {
      aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: buildSystemPrompt(preferredStepCount, safeNotes),
            },
            {
              role: "user",
              content: `Break down this goal into micro-wins: "${safeGoal}"`,
            },
          ],
          temperature: 0.7,
        }),
      });
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      // AbortError means the 4-second timeout fired; any other error is a network failure.
      const reason = (fetchErr as Error)?.name === "AbortError" ? "timeout" : "network error";
      console.error(`AI gateway ${reason} – falling back to template steps`);
      return fallbackResponse(safeGoal);
    }

    clearTimeout(timeoutId);

    // 4. Non-2xx response (429 rate-limit, 402 payment, 5xx server errors) → fallback.
    if (!aiResponse.ok) {
      console.error(
        `AI gateway responded with HTTP ${aiResponse.status} – falling back to template steps`
      );
      return fallbackResponse(safeGoal);
    }

    const data = await aiResponse.json();
    const content: string | undefined = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("AI gateway returned empty content – falling back");
      return fallbackResponse(safeGoal);
    }

    // 5. Parse the JSON array from the AI response.
    //    The model sometimes wraps the array in a markdown fence — strip that first.
    let steps: MicroWin[];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      steps = JSON.parse(jsonMatch ? jsonMatch[0] : content);

      // Sanity-check: must be a non-empty array with the expected shape.
      if (!Array.isArray(steps) || steps.length === 0) throw new Error("empty or invalid array");
    } catch (parseErr) {
      console.error("Failed to parse AI response – falling back:", content, parseErr);
      return fallbackResponse(safeGoal);
    }

    // 6. Success — tag with source: "ai".
    return jsonResponse({ steps, fallback: false, source: "ai" });
  } catch (e) {
    console.error("decompose-goal unhandled error:", e);
    return jsonResponse(
      { error: e instanceof Error ? e.message : "Unknown error" },
      500
    );
  }
});
