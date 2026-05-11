# AI Backend Database Structure

This schema is implemented in `database/migrations/005_patient_ai_telemedicine_extensions.sql`.

## Core AI Governance

### `ai_user_consents`
- Purpose: Per-patient consent controls for AI learning and analytics.
- Columns:
  - `id` UUID PK
  - `patient_id` UUID UNIQUE FK -> `patients.id`
  - `allow_learning` BOOLEAN
  - `allow_summaries` BOOLEAN
  - `allow_analytics` BOOLEAN
  - `updated_by` VARCHAR
  - timestamps
- Rule enforced in API:
  - `POST /ai/learning-samples` is rejected unless `allow_learning = true`.

### `ai_models`
- Purpose: Model registry and runtime status for super-admin controls.
- Columns:
  - `id` UUID PK
  - `model_key` UNIQUE
  - `display_name`
  - `mode` (`care` | `telemedicine` | `pharmacy`)
  - `status` (`loaded` | `unloaded`)
  - `version`
  - `dataset_ref` (free/open dataset link)
  - timestamps
- APIs:
  - `GET /org/ai/models`
  - `PUT /org/ai/models/status`

### `ai_learning_samples`
- Purpose: Store consented interaction samples for future training/fine-tuning.
- Columns:
  - `id` UUID PK
  - `patient_id` FK -> `patients.id`
  - `mode`
  - `sample_type` (symptom, telemed_summary, adherence, etc.)
  - `payload` JSONB
  - `consent_applied` BOOLEAN
  - timestamps
- API:
  - `POST /ai/learning-samples`

## Care Tracking Tables Used by AI

### `patient_chronic_care`
- Tracks chronic condition plans, severity, and risk score.
- Linked by `patient_id`.

### `patient_pregnancy_care`
- Tracks trimester, EDD, risk flags, and severity.
- Linked by `patient_id`.

### `patient_recurrent_medications`
- Tracks adherence, severity alerts, and diet/habit notes.
- Linked by `patient_id`.

## Telemedicine AI/Artifact Tables

### `telemedicine_session_artifacts`
- Stores AI-ready outputs and media metadata per session.
- Columns include:
  - `session_id` FK -> `patient_telemedicine_sessions.id`
  - `recording_url`, `transcript_url`
  - `summary`, `final_diagnosis`
  - `symptoms` JSONB array
  - `follow_up_needed` BOOLEAN

### `telemedicine_anatomy_annotations`
- Doctor symptom location markers over anatomy map.
- Coordinates stored as `%` values: `x_percent`, `y_percent`.
- Linked to session, patient, and optional doctor.

## Doctor Registry for Telemedicine

### `org_doctors`
- Verified doctors for organization workflows and telemedicine operations.
- APIs:
  - `GET /org/doctors`
  - `POST /org/doctors`

## Relationship Summary

- `patients` 1:1 `ai_user_consents`
- `patients` 1:N `ai_learning_samples`
- `patients` 1:N `patient_chronic_care`
- `patients` 1:N `patient_pregnancy_care`
- `patients` 1:N `patient_recurrent_medications`
- `patient_telemedicine_sessions` 1:N `telemedicine_session_artifacts`
- `patient_telemedicine_sessions` 1:N `telemedicine_anatomy_annotations`
- `org_doctors` 1:N `telemedicine_session_artifacts` / `telemedicine_anatomy_annotations`
