from __future__ import annotations

import json
import os
import re
from datetime import datetime, timezone
from typing import Literal
from uuid import uuid4

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

FREE_AI_PROVIDER = os.getenv("TRIAGE_FREE_AI_PROVIDER", "none").strip().lower()
FREE_AI_PROVIDER_CHAIN = [item.strip().lower() for item in FREE_AI_PROVIDER.split(",") if item.strip()]
FREE_AI_BASE_URL = os.getenv("TRIAGE_FREE_AI_BASE_URL", "http://localhost:11434").strip().rstrip("/")
FREE_AI_MODEL = os.getenv("TRIAGE_FREE_AI_MODEL", "llama3.2:3b").strip()
FREE_AI_TIMEOUT_MS = int(os.getenv("TRIAGE_FREE_AI_TIMEOUT_MS", "2200").strip() or "2200")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
GEMINI_BASE_URL = os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta").strip().rstrip("/")


class Vitals(BaseModel):
    systolicBp: int = Field(default=0, ge=0, le=300)
    diastolicBp: int = Field(default=0, ge=0, le=220)
    heartRate: int = Field(default=0, ge=0, le=260)
    respiratoryRate: int = Field(default=0, ge=0, le=80)
    temperatureC: float = Field(default=0.0, ge=0, le=45)
    oxygenSaturation: int = Field(default=0, ge=0, le=100)
    bloodGlucoseMgDl: int = Field(default=0, ge=0, le=1000)
    painScore: int = Field(default=0, ge=0, le=10)
    consciousness: str = ""


class Context(BaseModel):
    pregnant: bool = False
    trimester: int = Field(default=0, ge=0, le=3)
    chronicConditions: list[str] = Field(default_factory=list)
    currentMedications: list[str] = Field(default_factory=list)
    knownAllergies: list[str] = Field(default_factory=list)
    chiefComplaint: str = ""
    onsetHours: int = Field(default=0, ge=0, le=720)


class TriageRequest(BaseModel):
    patientLogicalId: str = Field(min_length=1)
    symptoms: list[str] = Field(default_factory=list)
    redFlags: list[str] = Field(default_factory=list)
    ageYears: int = Field(default=0, ge=0, le=120)
    channel: Literal["web", "mobile", "ussd", "unknown"] = "unknown"
    vitals: Vitals = Field(default_factory=Vitals)
    context: Context = Field(default_factory=Context)


class TriageResponse(BaseModel):
    id: str
    patientLogicalId: str
    symptoms: list[str]
    redFlags: list[str]
    vitals: Vitals
    context: Context
    severity: str
    score: int
    recommendedAction: str
    suggestions: list[str] = Field(default_factory=list)
    aiSeverity: str = ""
    aiScore: int = 0
    confidence: float = 0.0
    aiFallbackUsed: bool = False
    aiModelVersion: str = ""
    aiReasons: list[str] = Field(default_factory=list)
    createdAt: str


def normalize_suggestions(items: list[str], max_items: int = 8) -> list[str]:
    normalized: list[str] = []
    for raw_item in items:
        item = re.sub(r"^[-*\d.\s]+", "", raw_item).strip()
        if not item:
            continue
        if item.lower() in {existing.lower() for existing in normalized}:
            continue
        normalized.append(item[:180])
        if len(normalized) >= max_items:
            break
    return normalized


def severity_rank(value: str) -> int:
    return {"emergent": 4, "urgent": 3, "moderate": 2, "low": 1}.get(value.lower(), 0)


def max_severity(*values: str) -> str:
    ordered = [value for value in values if value]
    if not ordered:
        return "low"
    return max(ordered, key=severity_rank)


def compute_rule_severity(symptoms: list[str], red_flags: list[str]) -> str:
    joined = " ".join(symptoms + red_flags).lower()
    if any(term in joined for term in ["chest pain", "stroke", "seizure", "unconscious", "bleeding", "suicide", "anaphylaxis"]):
        return "emergent"
    if any(term in joined for term in ["shortness of breath", "difficulty breathing", "severe", "confused", "pregnant", "high fever"]):
        return "urgent"
    if symptoms or red_flags:
        return "moderate"
    return "low"


def vitals_rule_severity(vitals: Vitals) -> str:
    if vitals.oxygenSaturation and vitals.oxygenSaturation < 90:
        return "emergent"
    if vitals.systolicBp >= 180 or vitals.diastolicBp >= 120:
        return "emergent"
    if vitals.heartRate and (vitals.heartRate >= 130 or vitals.heartRate <= 45):
        return "urgent"
    if vitals.respiratoryRate and vitals.respiratoryRate >= 30:
        return "urgent"
    if vitals.temperatureC and vitals.temperatureC >= 39.5:
        return "urgent"
    if vitals.bloodGlucoseMgDl and (vitals.bloodGlucoseMgDl >= 400 or vitals.bloodGlucoseMgDl <= 60):
        return "urgent"
    if vitals.painScore >= 8:
        return "urgent"
    if vitals.consciousness and vitals.consciousness.lower() in {"altered", "avpu_p", "avpu_u"}:
        return "urgent"
    return "low"


def context_rule_severity(context: Context, age_years: int) -> str:
    if context.pregnant and context.onsetHours <= 24:
        return "urgent"
    if age_years and age_years >= 75:
        return "moderate"
    if context.chronicConditions or context.currentMedications or context.knownAllergies:
        return "moderate"
    return "low"


def build_suggestions(final_severity: str, vitals: Vitals, context: Context) -> list[str]:
    suggestions = [
        "Document a focused history and reassess symptoms if anything changes.",
        "Review allergies, medications, and prior visits before final routing.",
    ]
    if final_severity in {"urgent", "emergent"}:
        suggestions.insert(0, "Escalate the patient for immediate clinician review.")
    if vitals.oxygenSaturation and vitals.oxygenSaturation < 94:
        suggestions.append("Check oxygen saturation again and consider respiratory support guidance.")
    if context.pregnant:
        suggestions.append("Confirm pregnancy stage and obstetric warning signs.")
    return normalize_suggestions(suggestions)


def severity_to_score(severity: str) -> int:
    return {"emergent": 96, "urgent": 78, "moderate": 52, "low": 22}.get(severity.lower(), 18)


def recommended_action_for_severity(severity: str) -> str:
    return {
        "emergent": "immediate_emergency_review",
        "urgent": "urgent_clinician_review",
        "moderate": "standard_clinician_review",
        "low": "self_care_guidance",
    }.get(severity.lower(), "standard_clinician_review")


def free_ai_enabled() -> bool:
    return any(provider != "none" for provider in FREE_AI_PROVIDER_CHAIN) or bool(GEMINI_API_KEY)


def extract_suggestions_from_text(text: str) -> list[str]:
    return normalize_suggestions([line.strip("-• \t") for line in text.splitlines() if line.strip()])


def build_free_ai_prompt(payload: TriageRequest, final_severity: str, base_suggestions: list[str]) -> str:
    return (
        "You are a clinical triage suggestion assistant.\n"
        f"Patient ID: {payload.patientLogicalId}\n"
        f"Symptoms: {', '.join(payload.symptoms) or 'none'}\n"
        f"Red flags: {', '.join(payload.redFlags) or 'none'}\n"
        f"Rule severity: {final_severity}\n"
        f"Baseline suggestions: {json.dumps(base_suggestions)}\n"
        "Return 3 to 5 short bullet suggestions only."
    )


async def provider_suggestions(provider: str, prompt: str, timeout_ms: int) -> tuple[list[str], str]:
    timeout = timeout_ms / 1000
    if provider == "ollama":
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                f"{FREE_AI_BASE_URL}/api/generate",
                json={"model": FREE_AI_MODEL, "prompt": prompt, "stream": False},
            )
            response.raise_for_status()
            data = response.json()
            text = str(data.get("response", ""))
            suggestions = extract_suggestions_from_text(text)
            return suggestions, provider

    if provider == "gemini" and GEMINI_API_KEY:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                f"{GEMINI_BASE_URL}/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}",
                json={"contents": [{"parts": [{"text": prompt}]}]},
            )
            response.raise_for_status()
            data = response.json()
            parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
            text = "\n".join(str(part.get("text", "")) for part in parts if isinstance(part, dict))
            suggestions = extract_suggestions_from_text(text)
            return suggestions, provider

    return [], provider


async def free_ai_suggestions(payload: TriageRequest, final_severity: str, base_suggestions: list[str]) -> tuple[list[str], str]:
    prompt = build_free_ai_prompt(payload, final_severity, base_suggestions)
    for provider in FREE_AI_PROVIDER_CHAIN or (["gemini"] if GEMINI_API_KEY else []):
        try:
            suggestions, resolved_provider = await provider_suggestions(provider, prompt, FREE_AI_TIMEOUT_MS)
            if suggestions:
                return suggestions, resolved_provider
        except Exception:
            continue
    return base_suggestions, "rules"


@router.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok", "service": "ai-triage-service"}


@router.get("/health")
def health() -> dict[str, str]:
    return healthz()


@router.post("/score", response_model=TriageResponse)
async def score(payload: TriageRequest) -> TriageResponse:
    symptom_severity = compute_rule_severity(payload.symptoms, payload.redFlags)
    vitals_severity = vitals_rule_severity(payload.vitals)
    context_severity = context_rule_severity(payload.context, payload.ageYears)
    final_severity = max_severity(symptom_severity, vitals_severity, context_severity)
    base_suggestions = build_suggestions(final_severity, payload.vitals, payload.context)

    ai_suggestions, ai_provider = await free_ai_suggestions(payload, final_severity, base_suggestions) if free_ai_enabled() else (base_suggestions, "rules")
    ai_fallback_used = ai_provider == "rules"
    ai_score = severity_to_score(final_severity)
    reasons = [
        f"symptom_rule={symptom_severity}",
        f"vitals_rule={vitals_severity}",
        f"context_rule={context_severity}",
    ]
    if ai_provider != "rules":
        reasons.append(f"ai_provider={ai_provider}")

    return TriageResponse(
        id=str(uuid4()),
        patientLogicalId=payload.patientLogicalId,
        symptoms=payload.symptoms,
        redFlags=payload.redFlags,
        vitals=payload.vitals,
        context=payload.context,
        severity=final_severity,
        score=ai_score,
        recommendedAction=recommended_action_for_severity(final_severity),
        suggestions=ai_suggestions,
        aiSeverity=final_severity,
        aiScore=ai_score,
        confidence=0.92 if not ai_fallback_used else 0.74,
        aiFallbackUsed=ai_fallback_used,
        aiModelVersion=ai_provider if ai_provider != "rules" else "rules-only-v1",
        aiReasons=reasons,
        createdAt=datetime.now(timezone.utc).isoformat(),
    )


# ── Image Analysis endpoint ───────────────────────────────────────────────────

class ImageAnalysisRequest(BaseModel):
    image_base64: str = Field(min_length=1)
    image_type: str = Field(default="image/jpeg")
    context: str = Field(default="")  # patient symptoms for context


class ImageAnalysisResponse(BaseModel):
    detected_conditions: list[str]
    recommended_specialty: str
    confidence: float
    severity_indicators: list[str]
    disclaimer: str = "This AI analysis is not a medical diagnosis. Always consult a qualified healthcare professional."
    analyzed_at: str


@router.post("/analyze-image")
async def analyze_image(req: ImageAnalysisRequest) -> ImageAnalysisResponse:
    """
    Analyze a patient-submitted image using Gemini Vision to detect visible
    symptoms (rashes, swelling, eye conditions, wounds, etc.).
    """
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="Image analysis is not available — Gemini key not configured")

    # Pick first key if comma-separated
    api_key = GEMINI_API_KEY.split(",")[0].strip()

    prompt = (
        "You are a clinical visual symptom assistant. A patient has submitted a medical photo for guidance.\n"
        f"Patient context: {req.context or 'No additional context provided.'}\n\n"
        "Analyze the image carefully and respond ONLY with valid JSON in this exact format:\n"
        "{\n"
        '  "detected_conditions": ["list of specific visible findings"],\n'
        '  "recommended_specialty": "Medical specialty name",\n'
        '  "confidence": 0.75,\n'
        '  "severity_indicators": ["any visual signs that indicate severity"]\n'
        "}\n\n"
        "Be specific about visual findings (e.g. 'erythematous maculopapular rash on forearm', "
        "'periorbital edema', 'jaundiced sclera'). If no abnormality is visible, say so. "
        "Do NOT attempt a diagnosis."
    )

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {"inline_data": {"mime_type": req.image_type, "data": req.image_base64}},
                ]
            }
        ],
        "generationConfig": {"response_mime_type": "application/json"},
    }

    url = f"{GEMINI_BASE_URL}/models/{GEMINI_MODEL}:generateContent?key={api_key}"

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(url, json=payload)
            if not res.is_success:
                raise HTTPException(status_code=502, detail=f"Gemini Vision error: {res.text[:200]}")
            data = res.json()
            text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "{}")
            try:
                parsed = json.loads(text)
            except json.JSONDecodeError:
                parsed = {}
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Image analysis timed out")

    return ImageAnalysisResponse(
        detected_conditions=parsed.get("detected_conditions", ["No specific conditions identified"]),
        recommended_specialty=parsed.get("recommended_specialty", "General Practice"),
        confidence=float(parsed.get("confidence", 0.5)),
        severity_indicators=parsed.get("severity_indicators", []),
        analyzed_at=datetime.now(timezone.utc).isoformat(),
    )


# ── Doctor Matching endpoint ──────────────────────────────────────────────────

class DoctorProfile(BaseModel):
    id: str
    full_name: str
    specialty: str
    sub_specialty: str = ""
    years_experience: int = 0
    available: bool = True
    online: bool = False
    emergency_support: bool = False
    current_sessions: int = 0
    session_capacity: int = 1
    languages: list[str] = Field(default_factory=list)
    areas_of_expertise: list[str] = Field(default_factory=list)


class MatchDoctorsRequest(BaseModel):
    symptoms: str
    specialty: str
    urgency: str = "low"
    triage_score: int = 0
    available_doctors: list[DoctorProfile] = Field(default_factory=list)
    patient_language: str = "en"


class DoctorMatchResult(BaseModel):
    doctor_id: str
    full_name: str
    match_score: float
    match_reasons: list[str]
    rank: int


class MatchDoctorsResponse(BaseModel):
    matches: list[DoctorMatchResult]
    matched_at: str


@router.post("/match-doctors")
async def match_doctors(req: MatchDoctorsRequest) -> MatchDoctorsResponse:
    """
    Use AI to rank a list of available doctors against a patient's triage context.
    Falls back to a deterministic scoring algorithm if Gemini is unavailable.
    """

    def deterministic_score(doctor: DoctorProfile) -> tuple[float, list[str]]:
        score = 0.0
        reasons: list[str] = []

        # Specialty match
        req_spec = req.specialty.lower()
        doc_spec = doctor.specialty.lower()
        if req_spec in doc_spec or doc_spec in req_spec or any(w in doc_spec for w in req_spec.split()):
            score += 40
            reasons.append(f"Specialty matches: {doctor.specialty}")
        elif "general" in doc_spec or "emergency" in doc_spec:
            score += 20
            reasons.append("General/Emergency coverage")

        # Availability
        if doctor.available or doctor.online:
            score += 25
            reasons.append("Currently available")

        # Emergency for urgent cases
        if req.urgency in ("urgent", "emergent") and doctor.emergency_support:
            score += 20
            reasons.append("Supports emergency consultations")

        # Capacity
        if doctor.current_sessions < doctor.session_capacity:
            score += 10
            reasons.append("Has open session capacity")

        # Language
        if req.patient_language in doctor.languages:
            score += 5
            reasons.append(f"Speaks {req.patient_language}")

        # Experience
        if doctor.years_experience >= 5:
            score += min(doctor.years_experience, 20)
            reasons.append(f"{doctor.years_experience} years experience")

        return score, reasons

    # Try Gemini for smarter matching if available
    gemini_results: dict[str, tuple[float, list[str]]] = {}
    if GEMINI_API_KEY and len(req.available_doctors) <= 20:
        api_key = GEMINI_API_KEY.split(",")[0].strip()
        doctor_summaries = [
            f"- ID: {d.id}, Name: {d.full_name}, Specialty: {d.specialty}"
            + (f", Sub: {d.sub_specialty}" if d.sub_specialty else "")
            + f", Available: {d.available or d.online}, EmergencySupport: {d.emergency_support}"
            + (f", Languages: {', '.join(d.languages)}" if d.languages else "")
            for d in req.available_doctors
        ]
        prompt = (
            f"You are a healthcare triage AI. A patient needs care.\n"
            f"Symptoms: {req.symptoms}\n"
            f"Required specialty: {req.specialty}\n"
            f"Urgency: {req.urgency} (score: {req.triage_score})\n\n"
            f"Available doctors:\n" + "\n".join(doctor_summaries) + "\n\n"
            "Rank these doctors for this patient. Respond ONLY with JSON:\n"
            '{"rankings": [{"id": "doctor-id", "score": 85.0, "reasons": ["reason1"]}]}'
        )
        try:
            url = f"{GEMINI_BASE_URL}/models/{GEMINI_MODEL}:generateContent?key={api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"response_mime_type": "application/json"},
            }
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post(url, json=payload)
                if res.is_success:
                    data = res.json()
                    text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "{}")
                    parsed = json.loads(text)
                    for item in parsed.get("rankings", []):
                        gemini_results[item["id"]] = (float(item.get("score", 0)), item.get("reasons", []))
        except Exception:
            pass  # Fall through to deterministic

    # Build final ranking
    scored: list[tuple[DoctorProfile, float, list[str]]] = []
    for doc in req.available_doctors:
        if doc.id in gemini_results:
            sc, rs = gemini_results[doc.id]
        else:
            sc, rs = deterministic_score(doc)
        scored.append((doc, sc, rs))

    scored.sort(key=lambda x: x[1], reverse=True)

    matches = [
        DoctorMatchResult(
            doctor_id=doc.id,
            full_name=doc.full_name,
            match_score=round(sc, 1),
            match_reasons=rs,
            rank=i + 1,
        )
        for i, (doc, sc, rs) in enumerate(scored)
    ]

    return MatchDoctorsResponse(
        matches=matches,
        matched_at=datetime.now(timezone.utc).isoformat(),
    )
