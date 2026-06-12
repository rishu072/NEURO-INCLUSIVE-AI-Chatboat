import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// FIXED: PII masking – redact emails, phone numbers, and URLs before sending to AI
function maskPII(text: string): string {
  // Redact email addresses
  let masked = text.replace(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, "[redacted]");
  // Redact phone numbers (common formats: +1-555-555-5555, (555) 555-5555, 555.555.5555, etc.)
  masked = masked.replace(/(\+?\d[\s\-.]?)?(\(?\d{3}\)?[\s\-.]?)(\d{3}[\s\-.]?\d{4})/g, "[redacted]");
  // Redact URLs (http/https/ftp and www. prefixed)
  masked = masked.replace(/(?:https?:\/\/|ftp:\/\/|www\.)[^\s,;'")\]>]+/gi, "[redacted]");
  return masked;
}

// FIXED: Template-based fallback decomposition when AI is unavailable
function generateFallbackSteps(goal: string): Array<{ step: string; duration: number }> {
  const lower = goal.toLowerCase();

  if (/clean|tidy|organiz|wash|dust|sweep|vacuum|mop/.test(lower)) {
    return [
      { step: "🧹 Gather all supplies you need in one spot", duration: 2 },
      { step: "🗑️ Remove and throw away obvious trash first", duration: 3 },
      { step: "📦 Put misplaced items back in their correct places", duration: 5 },
      { step: "✨ Wipe down surfaces with a cloth or sponge", duration: 5 },
      { step: "🎉 Do a final sweep and admire your clean space", duration: 2 },
    ];
  }

  if (/write|essay|report|article|blog|draft|document/.test(lower)) {
    return [
      { step: "💡 Jot down your main idea or thesis in one sentence", duration: 3 },
      { step: "📝 List three key points you want to cover", duration: 5 },
      { step: "✍️ Write a rough opening paragraph without editing", duration: 5 },
      { step: "📖 Expand each key point into two or three sentences", duration: 5 },
      { step: "🔍 Read through and fix any obvious errors", duration: 5 },
    ];
  }

  if (/study|exam|test|learn|revision|review|homework|course/.test(lower)) {
    return [
      { step: "📚 Gather your notes and materials for this topic", duration: 2 },
      { step: "🔑 Identify the three most important concepts to review", duration: 5 },
      { step: "📝 Write a quick summary of each concept in your own words", duration: 5 },
      { step: "❓ Create five practice questions and answer them", duration: 5 },
      { step: "🏆 Review any answers you got wrong and note them", duration: 3 },
    ];
  }

  if (/email|message|reply|respond|contact|reach out/.test(lower)) {
    return [
      { step: "📋 List the key points you need to communicate", duration: 2 },
      { step: "✍️ Write a rough draft without worrying about tone", duration: 5 },
      { step: "🔍 Read through and adjust the tone to be clear and friendly", duration: 3 },
      { step: "📎 Attach any needed files or links", duration: 2 },
      { step: "✅ Read one last time then hit send", duration: 1 },
    ];
  }

  if (/exercise|workout|gym|run|jog|fitness|training/.test(lower)) {
    return [
      { step: "👟 Change into comfortable workout clothes", duration: 2 },
      { step: "🤸 Do a 3-minute warm-up stretch", duration: 3 },
      { step: "💪 Complete the first set of your main exercise", duration: 5 },
      { step: "🏃 Continue with remaining sets or cardio", duration: 5 },
      { step: "😌 Cool down with light stretching for 2 minutes", duration: 2 },
    ];
  }

  // Default generic steps
  return [
    { step: "🎯 Clarify exactly what 'done' looks like for this goal", duration: 2 },
    { step: "📋 Break the goal into three smaller sub-tasks", duration: 3 },
    { step: "⏱️ Start with the easiest sub-task first", duration: 5 },
    { step: "🔄 Tackle the next sub-task and track your progress", duration: 5 },
    { step: "✅ Complete the final sub-task and celebrate the win", duration: 5 },
  ];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { goal } = await req.json();

    // FIXED: PII masking – strip emails, phones, URLs before sending to AI
    const safeGoal = maskPII(goal);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // If no API key, immediately fall back
    if (!LOVABLE_API_KEY) {
      console.warn("LOVABLE_API_KEY not configured – using fallback decomposition");
      return new Response(
        JSON.stringify({ steps: generateFallbackSteps(safeGoal), fallback: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // FIXED: Wrap AI call in try/catch and fall back on any failure (network, 429, 402, non-ok)
    let response: Response;
    try {
      response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: `You are a neuro-inclusive productivity coach. When given a high-level goal, break it down into 4-7 small, concrete "Micro-Win" steps. Each step should take about 5 minutes or less. 

Rules:
- Each step must be a single, clear action (verb + object)
- Steps should be sequential and build toward the goal
- Use simple, encouraging language
- Include a brief motivational emoji at the start of each step
- Keep each step under 15 words

Respond ONLY with a valid JSON array of objects with "step" (string) and "duration" (number, minutes) fields. No markdown, no explanation.
Example: [{"step":"🎯 Write down your main idea in one sentence","duration":2},{"step":"📝 List three key points to support it","duration":5}]`,
              },
              {
                role: "user",
                content: `Break down this goal into micro-wins: "${safeGoal}"`,
              },
            ],
            temperature: 0.7,
          }),
        }
      );
    } catch (networkErr) {
      // FIXED: Network error → fall back to template
      console.error("AI gateway network error – falling back:", networkErr);
      return new Response(
        JSON.stringify({ steps: generateFallbackSteps(safeGoal), fallback: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // FIXED: Non-ok responses (429, 402, 5xx) → fall back instead of erroring
    if (!response.ok) {
      console.error("AI gateway returned", response.status, "– falling back to template");
      return new Response(
        JSON.stringify({ steps: generateFallbackSteps(safeGoal), fallback: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Parse the JSON from the AI response
    let steps;
    try {
      // Try to extract JSON from potential markdown wrapping
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      steps = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      console.error("Failed to parse AI response:", content, "– falling back");
      // FIXED: Parse failure → fall back to template
      return new Response(
        JSON.stringify({ steps: generateFallbackSteps(safeGoal), fallback: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ steps }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("decompose-goal error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
