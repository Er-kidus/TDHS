import { NextResponse } from "next/server";
import { orgAuthHeaderFromCookie } from "@/lib/routeAuth";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await orgAuthHeaderFromCookie(); // ensure authenticated

    const { id: sessionId } = await params;
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured on the server." },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({})) as {
      transcript?: string;
      chief_complaint?: string;
      symptoms?: string;
      current_medications?: string;
      previous_diseases?: string;
      allergies?: string;
      clinical_impressions?: string;
      treatment_plan?: string;
      follow_up?: boolean;
      patient_name?: string;
    };

    const {
      transcript = "",
      chief_complaint = "",
      symptoms = "",
      current_medications = "",
      previous_diseases = "",
      allergies = "",
      clinical_impressions = "",
      treatment_plan = "",
      follow_up = false,
      patient_name = "Patient",
    } = body;

    // Build structured prompt
    const prompt = `You are a clinical documentation assistant. Generate a concise, professional SOAP-format clinical encounter summary from the following telemedicine consultation data.

Patient: ${patient_name}
Session ID: ${sessionId}

SUBJECTIVE:
Chief Complaint: ${chief_complaint || "Not documented"}
Reported Symptoms: ${symptoms || "Not documented"}
Current Medications: ${current_medications || "None reported"}
Previous / Chronic Diseases: ${previous_diseases || "None reported"}
Allergies: ${allergies || "None reported"}

OBJECTIVE (from session notes & transcript):
${transcript || clinical_impressions || "No transcript or clinical observations available."}

ASSESSMENT:
Clinical Impressions: ${clinical_impressions || "Pending documentation"}

PLAN:
Treatment Plan: ${treatment_plan || "Pending documentation"}
Follow-up Required: ${follow_up ? "Yes" : "No"}

Instructions:
- Write in professional clinical language
- Keep the summary under 300 words
- Use the SOAP format (Subjective, Objective, Assessment, Plan)
- If information is missing for a section, note "Not documented" 
- Do NOT invent or hallucinate clinical details not provided
- End with a clear follow-up recommendation`;

    const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return NextResponse.json(
        { error: `Gemini API error: ${geminiRes.status} — ${errText.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const geminiData = await geminiRes.json() as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    const summary =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
      "Unable to generate summary — Gemini returned an empty response.";

    return NextResponse.json({ summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
