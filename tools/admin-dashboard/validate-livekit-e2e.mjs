import crypto from "node:crypto";

const API = "http://localhost:8000";
const JWT_SECRET = "dev-jwt-secret";
const PATIENT_SUB = "38833a08-155d-442c-91cb-a25efaded74f";
const ORG_SUB = "08b81117-3f8c-4f98-a45e-21aa76e40d15";

function signJwt(payload, secret) {
  const header = { alg: "HS256", typ: "JWT" };
  const headerPart = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadPart = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const unsigned = `${headerPart}.${payloadPart}`;
  const sig = crypto.createHmac("sha256", secret).update(unsigned).digest("base64url");
  return `${unsigned}.${sig}`;
}

async function req(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }
  return { ok: res.ok, status: res.status, payload };
}

async function main() {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600;
  const patientToken = signJwt({ sub: PATIENT_SUB, typ: "patient", role: "patient", iat: now, exp }, JWT_SECRET);
  const orgToken = signJwt({ sub: ORG_SUB, typ: "org", role: "doctor", org_id: "default-org", iat: now, exp }, JWT_SECRET);

  const createSession = await req("/telemedicine/sessions", {
    method: "POST",
    token: patientToken,
    body: {
      doctor_name: "Dr LiveKit SelfHosted",
      scheduled_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      preferred_mode: "video",
      requested_amount: 0,
      requested_currency: "ETB",
      notes: "validation run",
    },
  });
  if (!createSession.ok) {
    throw new Error(`CREATE_SESSION failed: ${createSession.status} ${JSON.stringify(createSession.payload)}`);
  }

  const sessionId = createSession.payload?.id;
  const roomName = `telemedicine-${sessionId}`;

  const patientLiveKit = await req("/telemedicine/livekit/token", {
    method: "POST",
    token: patientToken,
    body: {
      session_id: sessionId,
      room_name: roomName,
      display_name: "Patient Validation",
      role: "patient",
    },
  });
  if (!patientLiveKit.ok) {
    throw new Error(`PATIENT_TOKEN failed: ${patientLiveKit.status} ${JSON.stringify(patientLiveKit.payload)}`);
  }

  const orgLiveKit = await req("/telemedicine/livekit/token", {
    method: "POST",
    token: orgToken,
    body: {
      session_id: sessionId,
      room_name: roomName,
      display_name: "Doctor Validation",
      role: "doctor",
    },
  });
  if (!orgLiveKit.ok) {
    throw new Error(`ORG_TOKEN failed: ${orgLiveKit.status} ${JSON.stringify(orgLiveKit.payload)}`);
  }

  const sessionsList = await req("/telemedicine/sessions?limit=20", { token: patientToken });
  const current = Array.isArray(sessionsList.payload)
    ? sessionsList.payload.find((s) => s.id === sessionId)
    : null;

  console.log(`VALIDATION_SESSION_ID=${sessionId}`);
  console.log(`PATIENT_TOKEN_URL=${patientLiveKit.payload?.url || ""}`);
  console.log(`ORG_TOKEN_URL=${orgLiveKit.payload?.url || ""}`);
  console.log(`PATIENT_ROOM_NAME=${patientLiveKit.payload?.room_name || ""}`);
  console.log(`ORG_ROOM_NAME=${orgLiveKit.payload?.room_name || ""}`);
  console.log(`PATIENT_ROLE=${patientLiveKit.payload?.role || ""}`);
  console.log(`ORG_ROLE=${orgLiveKit.payload?.role || ""}`);
  console.log(`SESSION_STATUS=${current?.status || ""}`);
  console.log(`SESSION_CONNECTION_STATUS=${current?.connection_status || ""}`);
  console.log(`PATIENT_TOKEN_LEN=${String((patientLiveKit.payload?.token || "").length)}`);
  console.log(`ORG_TOKEN_LEN=${String((orgLiveKit.payload?.token || "").length)}`);
}

main().catch((err) => {
  console.error(`VALIDATION_ERROR=${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
