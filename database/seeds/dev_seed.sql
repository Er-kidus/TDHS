-- Dev seed data for patient, org, telemedicine, AI, and pharmacy workflows.

WITH seed_tenant AS (
	SELECT id FROM tenants WHERE slug = 'default' LIMIT 1
), seed_org AS (
	SELECT id FROM organizations WHERE slug = 'default-org' LIMIT 1
)
INSERT INTO users (tenant_id, organization_id, full_name, email, password_hash)
SELECT
	seed_tenant.id,
	seed_org.id,
	'System Super Admin',
	'superadmin@tenadam.local',
	crypt('SuperAdmin123!', gen_salt('bf'))
FROM seed_tenant, seed_org
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'superadmin@tenadam.local');

WITH seed_user AS (
	SELECT id FROM users WHERE email = 'superadmin@tenadam.local' LIMIT 1
)
INSERT INTO user_roles (user_id, role_id)
SELECT seed_user.id, (SELECT id FROM roles WHERE name = 'superadmin')
FROM seed_user
WHERE NOT EXISTS (
	SELECT 1 FROM user_roles WHERE user_id = seed_user.id AND role_id = (SELECT id FROM roles WHERE name = 'superadmin')
);

WITH seed_tenant AS (
	SELECT id FROM tenants WHERE slug = 'default' LIMIT 1
), seed_org AS (
	SELECT id FROM organizations WHERE slug = 'default-org' LIMIT 1
), seed_patient AS (
	SELECT id FROM patients WHERE email = 'demo.patient@tenadam.local' LIMIT 1
)
INSERT INTO patients (tenant_id, full_name, email, phone, password_hash, profile, active)
SELECT
	seed_tenant.id,
	'Demo Patient',
	'demo.patient@tenadam.local',
	'+251900000001',
	crypt('Patient123!', gen_salt('bf')),
	jsonb_build_object(
		'gender', 'female',
		'language', 'am',
		'preferred_language', 'am',
		'care_mode', 'telemedicine',
		'chronic_conditions', jsonb_build_array('Type 2 Diabetes', 'Hypertension')
	),
	TRUE
FROM seed_tenant
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE email = 'demo.patient@tenadam.local');

WITH seed_tenant AS (
	SELECT id FROM tenants WHERE slug = 'default' LIMIT 1
), seed_patient AS (
	SELECT id FROM patients WHERE email = 'demo.patient@tenadam.local' LIMIT 1
)
INSERT INTO ai_user_consents (tenant_id, patient_id, allow_learning, allow_summaries, allow_analytics, updated_by)
SELECT seed_tenant.id, seed_patient.id, TRUE, TRUE, TRUE, 'seed'
FROM seed_tenant, seed_patient
WHERE NOT EXISTS (SELECT 1 FROM ai_user_consents WHERE patient_id = seed_patient.id);

WITH seed_tenant AS (
	SELECT id FROM tenants WHERE slug = 'default' LIMIT 1
), seed_patient AS (
	SELECT id FROM patients WHERE email = 'demo.patient@tenadam.local' LIMIT 1
)
INSERT INTO patient_chronic_care (tenant_id, patient_id, condition_name, care_plan, severity_level, risk_score, last_review_at)
SELECT seed_tenant.id, seed_patient.id, 'Type 2 Diabetes', 'Daily glucose logs, monthly clinician review, dietary tracking, and medication adherence checks.', 'medium', 63.40, NOW() - INTERVAL '5 days'
FROM seed_tenant, seed_patient
WHERE NOT EXISTS (
	SELECT 1 FROM patient_chronic_care
	WHERE patient_id = seed_patient.id AND condition_name = 'Type 2 Diabetes'
);

WITH seed_tenant AS (
	SELECT id FROM tenants WHERE slug = 'default' LIMIT 1
), seed_patient AS (
	SELECT id FROM patients WHERE email = 'demo.patient@tenadam.local' LIMIT 1
)
INSERT INTO patient_pregnancy_care (tenant_id, patient_id, trimester, expected_delivery_date, high_risk, notes, severity_level)
SELECT seed_tenant.id, seed_patient.id, 2, CURRENT_DATE + INTERVAL '110 days', FALSE, 'Routine pregnancy follow-up with nutrition reminders and fetal movement tracking.', 'low'
FROM seed_tenant, seed_patient
WHERE NOT EXISTS (
	SELECT 1 FROM patient_pregnancy_care
	WHERE patient_id = seed_patient.id AND trimester = 2
);

WITH seed_tenant AS (
	SELECT id FROM tenants WHERE slug = 'default' LIMIT 1
), seed_patient AS (
	SELECT id FROM patients WHERE email = 'demo.patient@tenadam.local' LIMIT 1
)
INSERT INTO patient_recurrent_medications (tenant_id, patient_id, medication_name, taken_today, adherence_percent, appointment_severity, medication_alert_severity, last_taken_at, diet_notes)
SELECT seed_tenant.id, seed_patient.id, 'Metformin 500mg', TRUE, 94.20, 'medium', 'medium', NOW() - INTERVAL '4 hours', 'Reduced sugar intake and consistent meals.'
FROM seed_tenant, seed_patient
WHERE NOT EXISTS (
	SELECT 1 FROM patient_recurrent_medications
	WHERE patient_id = seed_patient.id AND medication_name = 'Metformin 500mg'
);

WITH seed_tenant AS (
	SELECT id FROM tenants WHERE slug = 'default' LIMIT 1
), seed_patient AS (
	SELECT id FROM patients WHERE email = 'demo.patient@tenadam.local' LIMIT 1
)
INSERT INTO org_doctors (tenant_id, organization_id, full_name, email, specialty, license_number, verified)
SELECT seed_tenant.id, (SELECT id FROM organizations WHERE slug = 'default-org'), 'Dr. Hana Tesfaye', 'hana.tesfaye@tenadam.local', 'Internal Medicine', 'MD-ET-2025-001', TRUE
FROM seed_tenant, seed_patient
WHERE NOT EXISTS (SELECT 1 FROM org_doctors WHERE email = 'hana.tesfaye@tenadam.local');

WITH seed_tenant AS (
	SELECT id FROM tenants WHERE slug = 'default' LIMIT 1
), seed_patient AS (
	SELECT id FROM patients WHERE email = 'demo.patient@tenadam.local' LIMIT 1
)
INSERT INTO patient_telemedicine_sessions (tenant_id, patient_id, doctor_name, scheduled_at, status, connection_status, notes)
SELECT seed_tenant.id, seed_patient.id, 'Dr. Hana Tesfaye', NOW() + INTERVAL '2 hours', 'scheduled', 'stable', 'Voice/video, chat, and file sharing enabled for the demo room.'
FROM seed_tenant, seed_patient
WHERE NOT EXISTS (
	SELECT 1 FROM patient_telemedicine_sessions
	WHERE patient_id = seed_patient.id AND doctor_name = 'Dr. Hana Tesfaye'
);

WITH seed_patient AS (
	SELECT id FROM patients WHERE email = 'demo.patient@tenadam.local' LIMIT 1
), seed_session AS (
	SELECT id, patient_id FROM patient_telemedicine_sessions
	WHERE patient_id = (SELECT id FROM seed_patient)
	ORDER BY created_at DESC
	LIMIT 1
)
INSERT INTO telemedicine_anatomy_annotations (tenant_id, session_id, patient_id, doctor_id, body_region, x_percent, y_percent, note, severity_level)
SELECT
	(SELECT id FROM tenants WHERE slug = 'default'),
	seed_session.id,
	seed_session.patient_id,
	(SELECT id FROM org_doctors WHERE email = 'hana.tesfaye@tenadam.local' LIMIT 1),
	'upper_chest',
	48.00,
	32.00,
	'Patient reported intermittent chest tightness during exertion.',
	'medium'
FROM seed_session
WHERE NOT EXISTS (
	SELECT 1 FROM telemedicine_anatomy_annotations
	WHERE session_id = seed_session.id AND body_region = 'upper_chest'
);

WITH seed_patient AS (
	SELECT id FROM patients WHERE email = 'demo.patient@tenadam.local' LIMIT 1
), seed_session AS (
	SELECT id, patient_id FROM patient_telemedicine_sessions
	WHERE patient_id = (SELECT id FROM seed_patient)
	ORDER BY created_at DESC
	LIMIT 1
)
INSERT INTO telemedicine_session_artifacts (tenant_id, session_id, patient_id, doctor_id, recording_url, transcript_url, summary, final_diagnosis, symptoms, follow_up_needed)
SELECT
	(SELECT id FROM tenants WHERE slug = 'default'),
	seed_session.id,
	seed_session.patient_id,
	(SELECT id FROM org_doctors WHERE email = 'hana.tesfaye@tenadam.local' LIMIT 1),
	'https://media.tenadam.local/demo/telemedicine/session-001-recording.mp4',
	'https://media.tenadam.local/demo/telemedicine/session-001-transcript.json',
	'English: Reviewed symptoms, medication adherence, and warning signs. Amharic: ምልክቶች እና መድሀኒት መከታተል ተገምግሟል።',
	'Telemedicine follow-up required',
	jsonb_build_array('chest tightness', 'fatigue', 'headache'),
	TRUE
FROM seed_session
WHERE NOT EXISTS (
	SELECT 1 FROM telemedicine_session_artifacts
	WHERE session_id = seed_session.id
);

WITH seed_patient AS (
	SELECT id FROM patients WHERE email = 'demo.patient@tenadam.local' LIMIT 1
), seed_session AS (
	SELECT id, patient_id FROM patient_telemedicine_sessions
	WHERE patient_id = (SELECT id FROM seed_patient)
	ORDER BY created_at DESC
	LIMIT 1
)
INSERT INTO appointments (tenant_id, patient_id, created_by, scheduled_at, reason, notes)
SELECT
	(SELECT id FROM tenants WHERE slug = 'default'),
	seed_session.patient_id,
	(SELECT id FROM users WHERE email = 'admin@tenadam.local' LIMIT 1),
	NOW() + INTERVAL '7 days',
	'Telemedicine follow-up',
	'Demo follow-up created from the telemedicine summary flow.'
FROM seed_session
WHERE NOT EXISTS (
	SELECT 1 FROM appointments
	WHERE patient_id = seed_session.patient_id AND reason = 'Telemedicine follow-up'
);

WITH seed_patient AS (
	SELECT id FROM patients WHERE email = 'demo.patient@tenadam.local' LIMIT 1
)
INSERT INTO ai_learning_samples (tenant_id, patient_id, mode, sample_type, payload, consent_applied)
SELECT
	(SELECT id FROM tenants WHERE slug = 'default'),
	seed_patient.id,
	'telemedicine',
	'session_summary',
	jsonb_build_object(
		'source', 'seed',
		'language', 'am',
		'message', 'Telemedicine summary sample ready for bilingual generation.',
		'topic', 'follow_up'
	),
	TRUE
FROM seed_patient
WHERE NOT EXISTS (
	SELECT 1 FROM ai_learning_samples
	WHERE patient_id = seed_patient.id AND sample_type = 'session_summary'
);

WITH seed_tenant AS (
	SELECT id FROM tenants WHERE slug = 'default' LIMIT 1
)
INSERT INTO pharmacy_medications (tenant_id, name, dosage, quantity_label, price, currency, prescription_required, in_stock)
SELECT seed_tenant.id, 'Atorvastatin', '20mg', '30 tablets', 18.00, 'USD', TRUE, TRUE
FROM seed_tenant
WHERE NOT EXISTS (SELECT 1 FROM pharmacy_medications WHERE name = 'Atorvastatin');

WITH seed_tenant AS (
	SELECT id FROM tenants WHERE slug = 'default' LIMIT 1
)
INSERT INTO pharmacies (tenant_id, name, location, distance_km, eta_minutes, open_now)
SELECT seed_tenant.id, 'Central Pharmacy', 'Addis Ababa, Bole Road', 2.40, 18, TRUE
FROM seed_tenant
WHERE NOT EXISTS (SELECT 1 FROM pharmacies WHERE name = 'Central Pharmacy');

WITH seed_patient AS (
	SELECT id FROM patients WHERE email = 'demo.patient@tenadam.local' LIMIT 1
), seed_med AS (
	SELECT id FROM pharmacy_medications WHERE name = 'Atorvastatin' LIMIT 1
)
INSERT INTO patient_pharmacy_orders (tenant_id, patient_id, medication_id, quantity, total_amount, currency, status, delivery_mode)
SELECT
	(SELECT id FROM tenants WHERE slug = 'default'),
	seed_patient.id,
	seed_med.id,
	2,
	36.00,
	'USD',
	'processing',
	'delivery'
FROM seed_patient, seed_med
WHERE NOT EXISTS (
	SELECT 1 FROM patient_pharmacy_orders
	WHERE patient_id = seed_patient.id AND medication_id = seed_med.id
);
