#!/usr/bin/env python3
"""
test_gemini_ai_summary.py
─────────────────────────────────────────────────────────────────────────────
Tests the Gemini AI clinical-summary pipeline used during telemedicine sessions.

Two test modes:
  1. DIRECT  — hits the Gemini API with a doctor-form payload (no auth needed)
  2. PORTAL  — hits the org-portal /api/org/telemedicine/sessions/{id}/ai-summary
               endpoint (requires a valid org JWT cookie or token)

Run:
    python tools/test_gemini_ai_summary.py
"""

import json
import os
import sys
import urllib.request
import urllib.error
from textwrap import indent, fill

# ── Configuration ────────────────────────────────────────────────────────────

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyA89grwimpUIqXZ8kRZNNgAp2S4P5p9REE")
GEMINI_MODEL   = os.environ.get("GEMINI_MODEL",   "gemini-2.5-flash")
GEMINI_ENDPOINT = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
)

# Portal base URL (change if running on a different host/port)
ORG_PORTAL_URL = os.environ.get("ORG_PORTAL_URL", "http://localhost:4000")

# A fake session ID — the portal endpoint uses this only for labelling
FAKE_SESSION_ID = "test-session-00000000-0000-0000-0000-000000000001"

# ── Sample clinical form data (as a doctor would fill during the session) ────

SAMPLE_FORM = {
    "patient_name": "Abebe Girma",
    "chief_complaint": "Persistent dry cough, mild fever, and fatigue for 5 days",
    "symptoms": "Dry cough, low-grade fever (37.8 °C), fatigue, mild headache, no shortness of breath",
    "current_medications": "Paracetamol 500 mg PRN (self-administered)",
    "previous_diseases": "Asthma (childhood, resolved), no chronic conditions",
    "allergies": "Penicillin (rash)",
    "clinical_impressions": "Likely upper respiratory tract infection, viral in origin. Lungs clear on auscultation.",
    "treatment_plan": "Symptomatic management. Increase fluids. Rest. Avoid cold exposure. Return if fever exceeds 39°C or breathing difficulty develops.",
    "follow_up": True,
    # Additional transcript context for the AI
    "transcript": (
        "Doctor: How long have you had the cough?\n"
        "Patient: About 5 days now. It is dry, no mucus.\n"
        "Doctor: Any chest pain or difficulty breathing?\n"
        "Patient: No, just the cough and I feel very tired.\n"
        "Doctor: Any recent travel or contact with sick people?\n"
        "Patient: I was at a crowded market 6 days ago.\n"
        "Doctor: Temperature shows 37.8. Lungs are clear. I think this is viral. "
        "We will manage symptoms and monitor."
    ),
}

# ── Helpers ──────────────────────────────────────────────────────────────────

BOLD   = "\033[1m"
GREEN  = "\033[92m"
CYAN   = "\033[96m"
YELLOW = "\033[93m"
RED    = "\033[91m"
RESET  = "\033[0m"

def banner(text: str, colour: str = CYAN) -> None:
    width = 72
    print(f"\n{colour}{BOLD}{'─' * width}{RESET}")
    print(f"{colour}{BOLD}  {text}{RESET}")
    print(f"{colour}{BOLD}{'─' * width}{RESET}")

def section(label: str, value: str, colour: str = "") -> None:
    print(f"\n{BOLD}{label}:{RESET}")
    for line in value.splitlines():
        print(f"  {colour}{line}{RESET}")

def post_json(url: str, payload: dict, headers: dict | None = None) -> tuple[int, dict | str]:
    body = json.dumps(payload).encode()
    req_headers = {"Content-Type": "application/json"}
    if headers:
        req_headers.update(headers)
    req = urllib.request.Request(url, data=body, headers=req_headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read().decode()
            return resp.status, json.loads(raw)
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode()
        try:
            return exc.code, json.loads(raw)
        except Exception:
            return exc.code, raw
    except Exception as exc:
        return 0, str(exc)

# ── Test 1: Direct Gemini API ────────────────────────────────────────────────

def build_prompt(form: dict) -> str:
    return f"""You are a clinical documentation assistant. Generate a concise, professional SOAP-format clinical encounter summary from the following telemedicine consultation data.

Patient: {form['patient_name']}

SUBJECTIVE:
Chief Complaint: {form['chief_complaint']}
Reported Symptoms: {form['symptoms']}
Current Medications: {form['current_medications']}
Previous / Chronic Diseases: {form['previous_diseases']}
Allergies: {form['allergies']}

OBJECTIVE (from session notes & transcript):
{form['transcript']}

ASSESSMENT:
Clinical Impressions: {form['clinical_impressions']}

PLAN:
Treatment Plan: {form['treatment_plan']}
Follow-up Required: {'Yes' if form['follow_up'] else 'No'}

Instructions:
- Write in professional clinical language
- Keep the summary under 300 words
- Use the SOAP format (Subjective, Objective, Assessment, Plan)
- If information is missing for a section, note "Not documented"
- Do NOT invent or hallucinate clinical details not provided
- End with a clear follow-up recommendation"""


def test_direct_gemini(form: dict) -> bool:
    banner("TEST 1 — Direct Gemini API Call", CYAN)
    print(f"  Endpoint : {GEMINI_ENDPOINT}")
    print(f"  Model    : {GEMINI_MODEL}")
    print(f"  Patient  : {form['patient_name']}")

    prompt = build_prompt(form)
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 1024,
            "thinkingConfig": {
                "thinkingBudget": 0,
            },
        },
    }

    print(f"\n{YELLOW}  ⟳  Sending request to Gemini...{RESET}")
    status, data = post_json(GEMINI_ENDPOINT, payload)

    print(f"  HTTP status: {status}")

    if status != 200:
        section("ERROR response", json.dumps(data, indent=2) if isinstance(data, dict) else str(data), RED)
        return False

    try:
        summary = data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (KeyError, IndexError, TypeError) as exc:
        section("PARSE ERROR", str(exc), RED)
        section("Raw response", json.dumps(data, indent=2), YELLOW)
        return False

    section("✅  AI-Generated Clinical Summary", summary, GREEN)

    # Print token usage if available
    usage = data.get("usageMetadata", {})
    if usage:
        print(f"\n  {BOLD}Token usage:{RESET}  "
              f"prompt={usage.get('promptTokenCount', '?')}  "
              f"response={usage.get('candidatesTokenCount', '?')}  "
              f"total={usage.get('totalTokenCount', '?')}")

    return True


# ── Test 2: Org-portal ai-summary endpoint ──────────────────────────────────

def test_portal_endpoint(form: dict, org_token: str | None = None) -> bool:
    banner("TEST 2 — Org-Portal /api/org/telemedicine/sessions/.../ai-summary", CYAN)

    url = f"{ORG_PORTAL_URL}/api/org/telemedicine/sessions/{FAKE_SESSION_ID}/ai-summary"
    print(f"  URL      : {url}")

    portal_payload = {
        "patient_name":        form["patient_name"],
        "chief_complaint":     form["chief_complaint"],
        "symptoms":            form["symptoms"],
        "current_medications": form["current_medications"],
        "previous_diseases":   form["previous_diseases"],
        "allergies":           form["allergies"],
        "clinical_impressions":form["clinical_impressions"],
        "treatment_plan":      form["treatment_plan"],
        "follow_up":           form["follow_up"],
        "transcript":          form["transcript"],
    }

    headers: dict = {}
    if org_token:
        headers["Authorization"] = f"Bearer {org_token}"
        print(f"  Auth     : Bearer token provided")
    else:
        print(f"  {YELLOW}Auth     : No token — endpoint may return 401 if auth is required{RESET}")

    print(f"\n{YELLOW}  ⟳  Sending request to org-portal...{RESET}")
    status, data = post_json(url, portal_payload, headers)
    print(f"  HTTP status: {status}")

    if status == 401 or status == 403:
        section("ℹ️  Auth required", 
                "The org-portal endpoint requires a valid org session cookie or Bearer token.\n"
                "Pass ORG_TOKEN=<your_token> as an env var to re-run with auth.", YELLOW)
        return False

    if status != 200:
        section("ERROR response", json.dumps(data, indent=2) if isinstance(data, dict) else str(data), RED)
        return False

    summary = (data.get("summary") or "") if isinstance(data, dict) else ""
    if not summary:
        section("⚠ No summary in response", json.dumps(data, indent=2), YELLOW)
        return False

    section("✅  Summary from org-portal endpoint", summary, GREEN)
    return True


# ── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    banner("Telemedicine AI Summary — Integration Test", BOLD)
    print(f"  Testing Gemini model: {BOLD}{GEMINI_MODEL}{RESET}")
    print(f"  API key (last 6):     ...{GEMINI_API_KEY[-6:]}")

    section("Sample clinical form data being submitted", "", "")
    for k, v in SAMPLE_FORM.items():
        if k == "transcript":
            continue
        label = k.replace("_", " ").title()
        val   = str(v)
        print(f"  {CYAN}{label:<28}{RESET}: {fill(val, width=60, subsequent_indent=' ' * 32)}")

    results: list[tuple[str, bool]] = []

    # Test 1 — always run
    ok1 = test_direct_gemini(SAMPLE_FORM)
    results.append(("Direct Gemini API", ok1))

    # Test 2 — portal (requires auth; skip if no token)
    org_token = os.environ.get("ORG_TOKEN")
    ok2 = test_portal_endpoint(SAMPLE_FORM, org_token)
    results.append(("Org-Portal endpoint", ok2))

    # Summary
    banner("RESULTS", BOLD)
    all_pass = True
    for name, passed in results:
        icon  = f"{GREEN}PASS{RESET}" if passed else f"{YELLOW}SKIP/FAIL{RESET}"
        print(f"  [{icon}]  {name}")
        if not passed:
            all_pass = False

    print()
    if all_pass:
        print(f"{GREEN}{BOLD}  All tests passed. Gemini AI integration is working correctly.{RESET}\n")
    else:
        print(f"{YELLOW}{BOLD}  Some tests were skipped or failed. See output above for details.{RESET}\n")


if __name__ == "__main__":
    main()
