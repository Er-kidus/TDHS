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
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()
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
