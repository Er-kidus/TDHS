import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || "").split(",")[0].trim();
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

interface SymptomAnalysisRequest {
  symptoms: string;
  ageGroup?: string;
  duration?: string;
  severity?: number;
  imageBase64?: string;
  imageType?: string;
}

interface TriageScore {
  urgency: "low" | "moderate" | "urgent" | "emergent";
  score: number;
  specialty: string;
  reasons: string[];
  suggestions: string[];
}

async function callTriageService(symptoms: string, ageGroup: string, severity: number): Promise<TriageScore> {
  const triageUrl = process.env.TRIAGE_SERVICE_URL || "http://ai-triage-service:8001";
  try {
    const res = await fetch(`${triageUrl}/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientLogicalId: "patient-web",
        symptoms: symptoms.split(/[,.\n]+/).map(s => s.trim()).filter(Boolean),
        redFlags: severity >= 8 ? ["severe pain reported"] : [],
        ageYears: ageGroup?.includes("Child") ? 8 : ageGroup?.includes("Teen") ? 15 : ageGroup?.includes("Senior") ? 67 : ageGroup?.includes("Elderly") ? 80 : 35,
        channel: "web",
        context: {
          chiefComplaint: symptoms,
          onsetHours: duration2hours(ageGroup || ""),
        },
      }),
    });
    if (!res.ok) throw new Error("Triage service error");
    const data = await res.json() as {
      aiSeverity: string;
      aiScore: number;
      suggestions: string[];
      aiReasons: string[];
    };
    return {
      urgency: (data.aiSeverity as "low" | "moderate" | "urgent" | "emergent") || "low",
      score: data.aiScore || 22,
      specialty: deriveSpecialty(symptoms, data.aiSeverity),
      reasons: data.aiReasons || [],
      suggestions: data.suggestions || [],
    };
  } catch {
    // Fallback: local rule-based scoring
    return localTriage(symptoms, severity);
  }
}

function duration2hours(d: string): number {
  if (d.includes("today") || d.includes("started")) return 4;
  if (d.includes("1–2 days")) return 36;
  if (d.includes("3–7")) return 96;
  if (d.includes("1–2 weeks")) return 240;
  if (d.includes("more")) return 480;
  return 24;
}

function localTriage(symptoms: string, severity: number): TriageScore {
  const lower = symptoms.toLowerCase();
  let urgency: "low" | "moderate" | "urgent" | "emergent" = "low";
  if (/chest pain|stroke|seiz|uncons|bleed|anaphyl/.test(lower) || severity >= 9) urgency = "emergent";
  else if (/breath|sever|confused|pregnant|high fever/.test(lower) || severity >= 7) urgency = "urgent";
  else if (severity >= 4 || lower.length > 20) urgency = "moderate";
  return {
    urgency,
    score: { emergent: 96, urgent: 78, moderate: 52, low: 22 }[urgency],
    specialty: deriveSpecialty(symptoms, urgency),
    reasons: [`severity_score=${severity}`, `symptom_text_analysis`],
    suggestions: [
      "Seek immediate care if symptoms worsen.",
      "Keep track of when symptoms change.",
    ],
  };
}

function deriveSpecialty(symptoms: string, urgency: string): string {
  const s = symptoms.toLowerCase();
  if (/heart|chest|palpitat|cardiac/.test(s)) return "Cardiology";
  if (/breath|lung|cough|asthma|wheez/.test(s)) return "Pulmonology";
  if (/rash|skin|itch|swell|dermat/.test(s)) return "Dermatology";
  if (/head|migrain|neuro|seizure|dizziness/.test(s)) return "Neurology";
  if (/stomach|abdom|nausea|vomit|diarrhea|bowel/.test(s)) return "Gastroenterology";
  if (/preg|baby|birth|labor|period/.test(s)) return "Obstetrics & Gynecology";
  if (/child|infant|toddler|pediatric/.test(s)) return "Pediatrics";
  if (/eye|vision|sight/.test(s)) return "Ophthalmology";
  if (/ear|throat|nose|sinus/.test(s)) return "ENT";
  if (/bone|joint|fracture|muscle|back/.test(s)) return "Orthopedics";
  if (/depress|anxiet|mental|stress|panic/.test(s)) return "Psychiatry / Mental Health";
  if (/urine|kidney|bladder/.test(s)) return "Nephrology / Urology";
  if (urgency === "emergent" || urgency === "urgent") return "Emergency Medicine";
  return "General Practice";
}

async function analyzeImageWithGemini(imageBase64: string, imageType: string, symptoms: string): Promise<{
  detected_conditions: string[];
  recommended_specialty: string;
  confidence: number;
}> {
  if (!GEMINI_API_KEY) throw new Error("Gemini API key not configured");

  const prompt = `You are a clinical visual symptom assistant. Analyze this medical image that a patient has shared.
Patient's reported symptoms: "${symptoms}"

Carefully examine the image and provide:
1. List any visible symptoms or conditions you can observe (be specific: rash type, swelling location, redness, etc.)
2. The medical specialty that would best address these visual findings
3. Your confidence level (0.0 to 1.0)

IMPORTANT: Always include this disclaimer in your response: "This is not a medical diagnosis."
Respond in JSON format only:
{
  "detected_conditions": ["condition1", "condition2"],
  "recommended_specialty": "Specialty Name",
  "confidence": 0.75,
  "disclaimer": "This is not a medical diagnosis."
}`;

  const res = await fetch(
    `${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: imageType, data: imageBase64 } },
          ],
        }],
        generationConfig: { response_mime_type: "application/json" },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini Vision error: ${errText.slice(0, 200)}`);
  }

  const data = await res.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  try {
    const parsed = JSON.parse(text) as {
      detected_conditions?: string[];
      recommended_specialty?: string;
      confidence?: number;
    };
    return {
      detected_conditions: parsed.detected_conditions ?? ["Unable to detect specific conditions"],
      recommended_specialty: parsed.recommended_specialty ?? "General Practice",
      confidence: parsed.confidence ?? 0.5,
    };
  } catch {
    return {
      detected_conditions: ["Image processed — consult a doctor for detailed assessment"],
      recommended_specialty: "General Practice",
      confidence: 0.4,
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as SymptomAnalysisRequest;
    const { symptoms, ageGroup = "", duration = "", severity = 5, imageBase64, imageType = "image/jpeg" } = body;

    if (!symptoms?.trim()) {
      return NextResponse.json({ error: "Symptoms are required" }, { status: 400 });
    }

    // Run triage scoring (parallel with image analysis if applicable)
    const [triageScore, imageAnalysis] = await Promise.all([
      callTriageService(symptoms, ageGroup, severity),
      imageBase64
        ? analyzeImageWithGemini(imageBase64, imageType, symptoms).catch(err => {
            console.error("Image analysis failed:", err);
            return null;
          })
        : Promise.resolve(null),
    ]);

    // If image gave a specialty recommendation, use it as override for non-emergent
    const finalSpecialty = imageAnalysis?.recommended_specialty && triageScore.urgency !== "emergent"
      ? imageAnalysis.recommended_specialty
      : triageScore.specialty;

    return NextResponse.json({
      urgency: triageScore.urgency,
      score: triageScore.score,
      specialty: finalSpecialty,
      reasons: triageScore.reasons,
      suggestions: triageScore.suggestions,
      imageAnalysis: imageAnalysis ?? undefined,
    });
  } catch (error) {
    console.error("Symptom analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
