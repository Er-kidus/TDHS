# Tenadam Digital Healthcare System

TENADAM is an integrated smart healthcare platform that combines hospital management, telemedicine, emergency response, and AI-driven services into a unified system to improve accessibility and efficiency in healthcare delivery.

## 🏗 Architecture

Tenadam is a **modular, multi-tenant digital health ERP** monorepo built using:

| Layer | Technology |
|-------|-----------|
| Backend Microservices | Go (Golang) |
| AI Services | Python (FastAPI) |
| Web Frontend | Next.js 14 (App Router) |
| Mobile | Capacitor |
| Database | PostgreSQL |
| Cache | Redis |
| Message Bus | Kafka |
| Deployment | Docker + Kubernetes |

---

## 📁 Repository Structure

```
tenadam/
├── apps/
│   ├── web/              # Next.js frontend (App Router)
│   ├── mobile/           # Capacitor mobile wrapper
│   └── ussd/             # USSD application (Go)
├── gateway/
│   └── api-gateway/      # API Gateway (Go)
├── services/
│   ├── core/             # auth, user, access-control, session, audit, consent, config
│   ├── registry/         # patient, practitioner, facility, organization, household, identifier
│   ├── clinical/         # encounter, clinical-data, procedure, careplan, note, document
│   ├── clinical-extensions/ # form, order, guideline, program, terminology
│   ├── diagnostics/      # lab, specimen, result, imaging, radiology
│   ├── pharmacy/         # medication, prescription, dispensing, inventory
│   ├── hospital/         # inpatient, ward, bed, nursing, shift-handoff
│   ├── emergency/        # emergency, triage, ICU, ambulance
│   ├── surgery/          # surgery, theatre, post-operative
│   ├── operations/       # appointment, scheduling, queue, referral
│   ├── financial/        # billing, invoicing, claims, payment, insurance
│   ├── supply-chain/     # inventory, procurement, vendor, warehouse
│   ├── ai/               # triage AI, diagnosis support, NLP, risk prediction (Python)
│   ├── telemedicine/     # video, chat, remote monitoring
│   ├── communication/    # notification, messaging, USSD, voice-TTS
│   ├── integration/      # FHIR, interoperability, event-bus
│   ├── analytics/        # reporting, dashboards, data quality
│   └── public-health/    # surveillance, outbreak detection, national reporting
├── packages/             # Shared Go packages
│   ├── types/
│   ├── utils/
│   ├── logger/
│   ├── config/
│   ├── auth-client/
│   ├── db/
│   └── events/
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── schemas/
├── infrastructure/
│   ├── docker/
│   ├── k8s/
│   ├── terraform/
│   └── scripts/
└── tools/
    ├── cli/
    └── codegen/
```

---

## 🚀 Getting Started

### Prerequisites

- Go 1.22+
- Node.js 20+
- Docker + Docker Compose
- kubectl (for Kubernetes deployments)

### Local Development

```bash
# 1. Copy environment variables
cp .env.example .env

# 2. Start infrastructure (PostgreSQL, Redis, Kafka)
make dev

# 3. Run database migrations
make migrate

# 4. Start the web frontend
cd apps/web && npm install && npm run dev

# 5. Start individual services
cd services/core/auth-service && go run ./cmd/main.go
```

### Build All

```bash
make build-all
```

### Run Tests

```bash
make test-go
make test-web
```

### Telemedicine Remote Fix (LiveKit Cloud)

For remote/ngrok sessions, the quickest stable setup is to use LiveKit Cloud for media transport.

1. Configure `.env`:

```bash
LIVEKIT_API_KEY=<your_livekit_api_key>
LIVEKIT_API_SECRET=<your_livekit_api_secret>
LIVEKIT_PUBLIC_URL=wss://<your-project>.livekit.cloud
```

1. Restart gateway and portals:

```bash
docker compose up -d api-gateway
```

1. Validate gateway env was applied:

```bash
$cid=$(docker compose ps -q api-gateway)
docker inspect $cid --format '{{range .Config.Env}}{{println .}}{{end}}' | grep '^LIVEKIT_PUBLIC_URL='
```

Expected: your `wss://<your-project>.livekit.cloud` URL.

1. Validate token payload returns cloud URL:

- From patient or org portal, open a telemedicine room and request a token.
- In browser DevTools network tab, inspect `POST /api/telemedicine/livekit/token` (or org equivalent).
- Confirm response `url`/`serverUrl` is your LiveKit Cloud `wss://` URL.

1. Validate end-to-end call connectivity:

- Join from two remote clients over HTTPS.
- In DevTools console, confirm no `ConnectionError: could not establish pc connection`.

Notes:

- The warning `AudioContext was not allowed to start` is a browser autoplay policy warning and is resolved by a user gesture (click/tap). It is separate from ICE/PC transport failures.
- `/livekit` rewrite proxy in patient-portal is now opt-in and only enabled when `LIVEKIT_PROXY_TARGET` is explicitly set.

---

## 🧩 Service Architecture

Each Go microservice follows the same internal structure:

```
service-name/
├── cmd/main.go           # Entry point
├── api/routes.go         # HTTP routes
├── internal/
│   ├── handler/          # HTTP handlers
│   ├── service/          # Business logic
│   ├── repository/       # Data access
│   ├── model/            # Domain models
│   ├── dto/              # Request/Response DTOs
│   ├── middleware/        # HTTP middleware
│   └── events/           # Event types & publishing
├── config/               # Service configuration
├── migrations/           # SQL migrations
├── Dockerfile
└── go.mod
```

Python AI services follow this structure:

```
ai-service-name/
├── app/
│   ├── main.py           # FastAPI entry point
│   ├── api/routes.py     # API routes
│   ├── models/           # Pydantic models
│   ├── services/         # Business logic
│   └── pipelines/        # ML pipelines
├── requirements.txt
└── Dockerfile
```

---

## 🔐 Multi-Tenancy

All services are tenant-aware. Every resource is scoped by `tenant_id`. Authentication is handled by the `auth-service` and validated at the API gateway layer.

## 📡 FHIR Compliance

The `integration/fhir-service` provides FHIR R4 compliant API endpoints. Clinical data can be exported/imported in FHIR format.

## 🤖 AI Services

AI services are Python-based (FastAPI) and include:
- **ai-triage-service** – Automated patient triage
- **ai-diagnosis-support-service** – Differential diagnosis suggestions
- **ai-clinical-decision-support-service** – Clinical guidelines & alerts
- **ai-risk-prediction-service** – Patient risk stratification
- **ai-nlp-service** – Clinical text processing
- **ai-population-health-service** – Population analytics
- **ai-audit-service** – Automated audit trail analysis
- **ai-policy-service** – Policy compliance checking

## 📱 Mobile

The mobile app is built with **Capacitor** wrapping the Next.js web app, enabling native Android and iOS deployment from a single codebase.

## 📞 USSD & Voice

Rural and low-connectivity users can access key features via USSD shortcodes and voice-based IVR through `communication/ussd-service` and `communication/voice-tts-service`.

---

## 📄 License

See [LICENSE](./LICENSE).
