"""
Minimal Gemini AI test — saves results to test_result.json
Run: py tools/run_gemini_test.py
"""
import json, urllib.request, urllib.error, sys

API_KEY = "AIzaSyA89grwimpUIqXZ8kRZNNgAp2S4P5p9REE"
MODEL   = "gemini-2.5-flash"
URL     = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"

PROMPT = """You are a clinical documentation assistant. Generate a SOAP-format clinical summary.

Patient: Abebe Girma (Test Patient)
Session: Telemedicine video consultation

SUBJECTIVE:
Chief Complaint: Persistent dry cough, mild fever (37.8C), and fatigue for 5 days
Reported Symptoms: Dry cough, low-grade fever, fatigue, mild headache, no shortness of breath
Current Medications: Paracetamol 500mg PRN (self-administered)
Previous Diseases: Childhood asthma (resolved)
Allergies: Penicillin (rash)

OBJECTIVE (Transcript):
Doctor: How long have you had the cough?
Patient: About 5 days. Dry, no mucus.
Doctor: Any chest pain or difficulty breathing?
Patient: No. Just cough and fatigue.
Doctor: Lungs are clear. Temperature 37.8. I think this is viral.

ASSESSMENT:
Clinical Impressions: Likely upper respiratory tract infection, viral origin. Lungs clear.

PLAN:
Treatment: Symptomatic management. Rest, fluids, avoid cold.
Follow-up: Required if fever exceeds 39C or breathing difficulty develops.

Write a professional SOAP summary under 300 words. End with a follow-up recommendation."""

payload = {
    "contents": [{"parts": [{"text": PROMPT}]}],
    "generationConfig": {
        "temperature": 0.3,
        "maxOutputTokens": 1024,
        "thinkingConfig": {"thinkingBudget": 0},
    },
}

print(f"[TEST] Calling Gemini API...")
print(f"[TEST] Model  : {MODEL}")
print(f"[TEST] API Key: ...{API_KEY[-6:]}")
print(f"[TEST] Sending clinical form data for patient: Abebe Girma")
print()

body = json.dumps(payload).encode()
req = urllib.request.Request(URL, data=body, headers={"Content-Type": "application/json"}, method="POST")

try:
    with urllib.request.urlopen(req, timeout=90) as resp:
        data = json.loads(resp.read())
        
    summary = data["candidates"][0]["content"]["parts"][0]["text"].strip()
    usage   = data.get("usageMetadata", {})

    print("=" * 70)
    print("RESULT: SUCCESS")
    print("=" * 70)
    print()
    print("AI-Generated Clinical Summary:")
    print("-" * 70)
    print(summary)
    print("-" * 70)
    print()
    print(f"Tokens used  : prompt={usage.get('promptTokenCount','?')}  "
          f"response={usage.get('candidatesTokenCount','?')}  "
          f"total={usage.get('totalTokenCount','?')}")
    print()
    print("[TEST] PASSED — Gemini AI integration is working correctly.")

    with open("tools/test_result.json", "w") as f:
        json.dump({"status": "ok", "summary": summary, "usage": usage}, f, indent=2)
    print("[TEST] Full result saved to tools/test_result.json")

except urllib.error.HTTPError as exc:
    err = exc.read().decode()
    print(f"[TEST] FAILED — HTTP {exc.code}")
    print(err[:1000])
    sys.exit(1)
except Exception as exc:
    print(f"[TEST] FAILED — {exc}")
    sys.exit(1)
