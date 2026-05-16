import { NextResponse } from "next/server";
import { orgAuthHeaderFromCookie } from "@/lib/routeAuth";

// Support multiple comma-separated keys with failover
const RAW_GEMINI_KEYS = (process.env.GEMINI_API_KEY ?? "").split(",").map((k) => k.trim()).filter(Boolean);
const RAW_GROQ_KEYS = (process.env.GROQ_API_KEY ?? "").split(",").map((k) => k.trim()).filter(Boolean);
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

async function callGemini(prompt: string): Promise<string> {
  for (const key of RAW_GEMINI_KEYS) {
    try {
      const res = await fetch(`${GEMINI_ENDPOINT}?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 1024, thinkingConfig: { thinkingBudget: 0 } },
        }),
      });
      if (!res.ok) continue;
      const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) return text;
    } catch { continue; }
  }
  throw new Error("All Gemini API keys failed.");
}

async function callGroq(prompt: string): Promise<string> {
  for (const key of RAW_GROQ_KEYS) {
    try {
      const res = await fetch(GROQ_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1024,
          temperature: 0.4,
        }),
      });
      if (!res.ok) continue;
      const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return text;
    } catch { continue; }
  }
  throw new Error("All Groq API keys failed.");
}

async function callAI(prompt: string): Promise<string> {
  if (RAW_GEMINI_KEYS.length > 0) {
    try { return await callGemini(prompt); } catch { /* fall through */ }
  }
  if (RAW_GROQ_KEYS.length > 0) {
    return await callGroq(prompt);
  }
  throw new Error("No AI providers configured. Set GEMINI_API_KEY or GROQ_API_KEY.");
}

function buildPrompt(mode: string, message: string): string {
  switch (mode) {
    case "triage_evaluator":
      return `You are a clinical triage AI assistant in an outpatient/emergency setting.

${message}

Provide a structured triage evaluation in EXACTLY this format:
1. SEVERITY LEVEL: [Green/Yellow/Orange/Red] — [1-line justification]
2. RED FLAGS IDENTIFIED: [list concerning symptoms/vitals, or "None identified"]
3. RECOMMENDED ACTION: [Self-care / Standard review / Urgent review / Immediate emergency]
4. CLINICAL SUGGESTIONS: [2-3 specific actions the nurse should take now]
5. ESCALATION TRIGGERS: [Conditions requiring immediate upgrade of triage level]

Be concise (under 300 words). Clinical language. Flag critical findings prominently. Advisory only.`;

    case "medsafe_check":
      return `You are a clinical pharmacist AI assistant. ${message}

Analyze for: 1) Drug interactions 2) Allergy contraindications 3) Pregnancy safety category 4) Monitoring parameters 5) Alternatives.
Under 250 words. Flag concerns for clinician review.`;

    case "clinical_knowledge_base":
      return `You are a clinical decision support AI. ${message}

Provide: 1) Evidence-based guidelines (WHO/NICE/CDC) 2) Diagnostic criteria 3) First-line treatment 4) Drug references 5) Red flags/referral criteria.
Under 300 words. Cite sources.`;

    case "diet_assistant":
      return `You are a clinical dietitian AI. ${message}

Provide evidence-based nutrition guidance: recommended foods, foods to avoid, hydration, condition-specific modifications. Under 250 words.`;

    case "health_recommender":
      return `You are a clinical exercise physiologist AI. ${message}

Provide safe exercise recommendations: types, frequency/duration/intensity, contraindicated activities, monitoring parameters. Under 250 words.`;

    case "pregnancy_assistant":
      return `You are an obstetric AI supporting prenatal care.

${message}

Provide: 1) Symptom assessment 2) Normal vs concerning findings by gestational week 3) When to seek urgent care 4) Nutrition/lifestyle guidance.
Under 250 words. Flag urgent symptoms (bleeding, severe pain, decreased fetal movement) clearly. Advisory only.`;

    case "chronic_care_assistant":
      return `You are a chronic disease management AI.

${message}

Provide: 1) Condition management assessment 2) Medication adherence guidance 3) Lifestyle modifications 4) Emergency warning signs 5) Next check-up recommendations.
Under 250 words. Patient-friendly language. Flag emergencies clearly.`;

    default:
      return `You are a concise clinical AI assistant.
Mode: ${mode}
Request: ${message}

Respond in 2-4 short paragraphs. Professional clinical language. Do not claim diagnostic certainty.`;
  }
}

export async function POST(request: Request) {
  try {
    await orgAuthHeaderFromCookie();

    const body = await request.json().catch(() => ({})) as { mode?: string; message?: string };
    const mode = (body.mode ?? "general").trim();
    const message = (body.message ?? "").trim();

    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    if (RAW_GEMINI_KEYS.length === 0 && RAW_GROQ_KEYS.length === 0) {
      return NextResponse.json({ error: "No AI API keys configured." }, { status: 500 });
    }

    const prompt = buildPrompt(mode, message);
    const reply = await callAI(prompt);
    return NextResponse.json({ reply, mode });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
