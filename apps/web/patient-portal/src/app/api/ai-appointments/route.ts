import { NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

interface OrgOption {
  id: string;
  name: string;
  address?: string;
  services?: string[];
  distanceKm?: number;
}

interface AiAppointmentRequest {
  messages: ChatMessage[];
  organizations: OrgOption[];
  services: string[];
  patientLat?: number;
  patientLon?: number;
}

const SYSTEM_PROMPT = `You are a friendly AI appointment booking assistant for a healthcare platform.
Your job is to help patients book medical appointments at registered healthcare organizations.

Guidelines:
- Be conversational, warm, and concise (max 3 sentences per response).
- Ask one question at a time.
- When the patient tells you what they need, find matching organizations from the list provided.
- Ask for their preferred date/time if not provided.
- Once you have: (1) service type, (2) organization, (3) date/time — confirm the booking details.
- When the patient confirms, respond with a JSON action block like:
  <ACTION>{"type":"book","appointmentType":"in-person","facilityId":"...","facilityName":"...","serviceType":"...","scheduledAt":"2025-01-15T10:00:00.000Z","reason":"..."}</ACTION>
- Valid values for appointmentType are "in-person" or "telemedicine". If they ask for online/remote/telemedicine, use "telemedicine".
- If no organizations match, apologize and list the available services.
- Never invent organizations or services that are not in the provided list.
- Keep distance info in mind — always recommend the nearest matching organization first.
- Format dates in a friendly readable way when confirming (e.g. "Monday January 15th at 10:00 AM").`;

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI not configured" }, { status: 503 });
  }

  let body: AiAppointmentRequest;
  try {
    body = (await request.json()) as AiAppointmentRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { messages, organizations, services, patientLat, patientLon } = body;

  if (!messages?.length) {
    return NextResponse.json({ error: "messages are required" }, { status: 400 });
  }

  // Build context for Gemini
  const orgContext = organizations.length > 0
    ? organizations.map((o) => {
        const dist = o.distanceKm !== undefined ? ` (${o.distanceKm.toFixed(1)} km away)` : "";
        const svcs = o.services?.join(", ") || "general services";
        return `- ${o.name}${dist}: ${o.address || "address on file"} | Services: ${svcs} | ID: ${o.id}`;
      }).join("\n")
    : "No organizations loaded yet.";

  const locationContext = patientLat !== undefined && patientLon !== undefined
    ? `Patient location: ${patientLat.toFixed(4)}, ${patientLon.toFixed(4)}`
    : "Patient location: not provided";

  const contextBlock = `
Current System Date & Time: ${new Date().toLocaleString()} (You MUST NOT allow booking dates prior to this).

Available organizations (sorted by distance from patient):
${orgContext}

Available services: ${services.length > 0 ? services.join(", ") : "general consultation, telemedicine, emergency care"}
${locationContext}
`;

  // Convert to Gemini history format
  const geminiHistory = messages.slice(0, -1).map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  const lastMessage = messages[messages.length - 1];

  const requestBody = {
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPT + "\n\n" + contextBlock }],
    },
    contents: [
      ...geminiHistory,
      {
        role: "user",
        parts: [{ text: lastMessage.content }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 512,
      thinkingConfig: { thinkingBudget: 0 },
    },
  };

  try {
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini error:", errText);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const data = (await res.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Check for action block
    const actionMatch = text.match(/<ACTION>([\s\S]*?)<\/ACTION>/);
    let action: Record<string, unknown> | null = null;
    let replyText = text.replace(/<ACTION>[\s\S]*?<\/ACTION>/g, "").trim();

    if (actionMatch) {
      try {
        action = JSON.parse(actionMatch[1]) as Record<string, unknown>;
      } catch {
        // ignore parse error
      }
    }

    return NextResponse.json({ message: replyText, action });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
