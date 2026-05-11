package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"time"

	"github.com/tenadam/api-gateway/internal/model"
)

func (r *Repository) ListDoctors(ctx context.Context, limit int) ([]*model.Doctor, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	out := make([]*model.Doctor, 0)
	seen := make(map[string]struct{})

	addDoctor := func(item *model.Doctor) {
		if item == nil {
			return
		}
		if _, ok := seen[item.ID]; ok {
			return
		}
		seen[item.ID] = struct{}{}
		out = append(out, item)
	}

	qry := `SELECT id, full_name, specialty, location, rating, years_exp, available, available_at, created_at, updated_at FROM doctors ORDER BY available DESC, full_name ASC LIMIT $1`
	rows, err := r.db.QueryContext(ctx, qry, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var it model.Doctor
		var availableAt sql.NullTime
		if err := rows.Scan(&it.ID, &it.FullName, &it.Specialty, &it.Location, &it.Rating, &it.YearsExp, &it.Available, &availableAt, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return nil, err
		}
		it.Online = it.Available
		if availableAt.Valid {
			t := availableAt.Time
			it.AvailableAt = &t
		}
		addDoctor(&it)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	orgRows, err := r.db.QueryContext(ctx, `SELECT id, full_name, specialty, license_number, verified, created_at FROM org_doctors ORDER BY verified DESC, full_name ASC LIMIT $1`, limit)
	if err != nil {
		return nil, err
	}
	defer orgRows.Close()

	for orgRows.Next() {
		var id, fullName, specialty, licenseNumber string
		var verified bool
		var createdAt time.Time
		if err := orgRows.Scan(&id, &fullName, &specialty, &licenseNumber, &verified, &createdAt); err != nil {
			return nil, err
		}
		addDoctor(&model.Doctor{
			Base:                 model.Base{ID: id, CreatedAt: createdAt, UpdatedAt: createdAt},
			FullName:             fullName,
			Specialty:            specialty,
			Location:             "Organization telemedicine",
			Rating:               5,
			YearsExp:             0,
			Available:            verified,
			Online:               verified,
			TelemedicineEnabled:  true,
			ConsultationCurrency: "ETB",
			TelemedicineModes:    []string{"video", "voice", "chat"},
		})
	}
	if err := orgRows.Err(); err != nil {
		return nil, err
	}

	userRows, err := r.db.QueryContext(ctx, `
		SELECT DISTINCT ON (users.id)
			users.id,
			users.full_name,
			LOWER(COALESCE(NULLIF(sp.telemedicine_specialty, ''), NULLIF(sp.professional_title, ''), NULLIF(sp.role, ''), NULLIF(roles.name, ''), 'doctor')) AS clinician_role,
			COALESCE(organizations.name, '') AS organization_name,
			users.active,
			users.created_at,
			COALESCE(sp.telemedicine_enabled, FALSE),
			COALESCE(sp.telemedicine_rate, 0),
			COALESCE(sp.telemedicine_currency, 'ETB'),
			COALESCE(sp.telemedicine_modes, '["video","voice","chat"]'::jsonb)
		FROM users
		LEFT JOIN org_staff_profiles sp ON sp.user_id = users.id
		LEFT JOIN user_roles ON user_roles.user_id = users.id
		LEFT JOIN roles ON roles.id = user_roles.role_id
		LEFT JOIN organizations ON organizations.id = COALESCE(sp.organization_id, users.organization_id)
		WHERE LOWER(COALESCE(NULLIF(sp.role, ''), NULLIF(roles.name, ''), '')) IN ('doctor', 'nurse')
		  AND COALESCE(sp.telemedicine_enabled, FALSE) = TRUE
		ORDER BY users.id, users.created_at DESC
		LIMIT $1
	`, limit)
	if err != nil {
		return nil, err
	}
	defer userRows.Close()

	for userRows.Next() {
		var id, fullName, roleName, organizationName string
		var active bool
		var createdAt time.Time
		var telemedicineEnabled bool
		var consultationRate float64
		var consultationCurrency string
		var telemedicineModesRaw []byte
		if err := userRows.Scan(&id, &fullName, &roleName, &organizationName, &active, &createdAt, &telemedicineEnabled, &consultationRate, &consultationCurrency, &telemedicineModesRaw); err != nil {
			return nil, err
		}
		telemedicineModes := []string{"video", "voice", "chat"}
		if len(telemedicineModesRaw) > 0 {
			_ = json.Unmarshal(telemedicineModesRaw, &telemedicineModes)
		}
		specialty := "General Practice"
		if roleName != "" {
			specialty = roleName
		}
		location := organizationName
		if location == "" {
			location = "Organization"
		}
		addDoctor(&model.Doctor{
			Base:                 model.Base{ID: id, CreatedAt: createdAt, UpdatedAt: createdAt},
			FullName:             fullName,
			Specialty:            specialty,
			Location:             location,
			Rating:               5,
			YearsExp:             0,
			Available:            active,
			Online:               active,
			TelemedicineEnabled:  telemedicineEnabled,
			ConsultationRate:     consultationRate,
			ConsultationCurrency: consultationCurrency,
			TelemedicineModes:    telemedicineModes,
		})
	}

	if err := userRows.Err(); err != nil {
		return nil, err
	}

	return out, nil
}

func (r *Repository) ListPrescriptionsByPatient(ctx context.Context, patientID string, limit int) ([]*model.Prescription, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	qry := `SELECT id, patient_id, prescribing_doctor, medication_name, dosage, frequency, refill_due_date, status, created_at, updated_at FROM patient_prescriptions WHERE patient_id=$1 ORDER BY created_at DESC LIMIT $2`
	rows, err := r.db.QueryContext(ctx, qry, patientID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]*model.Prescription, 0)
	for rows.Next() {
		var it model.Prescription
		var refill sql.NullTime
		if err := rows.Scan(&it.ID, &it.PatientID, &it.PrescribingDoctor, &it.MedicationName, &it.Dosage, &it.Frequency, &refill, &it.Status, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return nil, err
		}
		if refill.Valid {
			t := refill.Time
			it.RefillDueDate = &t
		}
		out = append(out, &it)
	}
	return out, rows.Err()
}

func (r *Repository) ListLabResultsByPatient(ctx context.Context, patientID string, limit int) ([]*model.LabResult, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	qry := `SELECT id, patient_id, test_name, status, result_value, normal_range, abnormal, collected_at, created_at, updated_at FROM patient_lab_results WHERE patient_id=$1 ORDER BY created_at DESC LIMIT $2`
	rows, err := r.db.QueryContext(ctx, qry, patientID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]*model.LabResult, 0)
	for rows.Next() {
		var it model.LabResult
		var result sql.NullString
		var normal sql.NullString
		var collected sql.NullTime
		if err := rows.Scan(&it.ID, &it.PatientID, &it.TestName, &it.Status, &result, &normal, &it.Abnormal, &collected, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return nil, err
		}
		if result.Valid {
			v := result.String
			it.ResultValue = &v
		}
		if normal.Valid {
			v := normal.String
			it.NormalRange = &v
		}
		if collected.Valid {
			t := collected.Time
			it.CollectedAt = &t
		}
		out = append(out, &it)
	}
	return out, rows.Err()
}

func (r *Repository) ListInvoicesByPatient(ctx context.Context, patientID string, limit int) ([]*model.Invoice, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	qry := `SELECT id, patient_id, invoice_number, amount, currency, status, due_date, created_at, updated_at FROM patient_invoices WHERE patient_id=$1 ORDER BY created_at DESC LIMIT $2`
	rows, err := r.db.QueryContext(ctx, qry, patientID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]*model.Invoice, 0)
	for rows.Next() {
		var it model.Invoice
		var due sql.NullTime
		if err := rows.Scan(&it.ID, &it.PatientID, &it.InvoiceNumber, &it.Amount, &it.Currency, &it.Status, &due, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return nil, err
		}
		if due.Valid {
			t := due.Time
			it.DueDate = &t
		}
		out = append(out, &it)
	}
	return out, rows.Err()
}

func (r *Repository) GetInsuranceByPatient(ctx context.Context, patientID string) (*model.Insurance, error) {
	qry := `SELECT id, patient_id, provider, policy_number, coverage, valid_from, valid_to, claims_history, created_at, updated_at FROM patient_insurance WHERE patient_id=$1`
	var it model.Insurance
	var validFrom sql.NullTime
	var validTo sql.NullTime
	var claimsRaw []byte
	if err := r.db.QueryRowContext(ctx, qry, patientID).Scan(&it.ID, &it.PatientID, &it.Provider, &it.PolicyNumber, &it.Coverage, &validFrom, &validTo, &claimsRaw, &it.CreatedAt, &it.UpdatedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	if validFrom.Valid {
		t := validFrom.Time
		it.ValidFrom = &t
	}
	if validTo.Valid {
		t := validTo.Time
		it.ValidTo = &t
	}
	claims := map[string]any{}
	if len(claimsRaw) > 0 {
		_ = json.Unmarshal(claimsRaw, &claims)
	}
	it.ClaimsHistory = claims
	return &it, nil
}

func (r *Repository) ListMessagesByPatient(ctx context.Context, patientID string, limit int) ([]*model.PatientMessage, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	qry := `SELECT id, patient_id, sender, channel, content, attachment_url, read, created_at, updated_at FROM patient_messages WHERE patient_id=$1 ORDER BY created_at DESC LIMIT $2`
	rows, err := r.db.QueryContext(ctx, qry, patientID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]*model.PatientMessage, 0)
	for rows.Next() {
		var it model.PatientMessage
		var attachment sql.NullString
		if err := rows.Scan(&it.ID, &it.PatientID, &it.Sender, &it.Channel, &it.Content, &attachment, &it.Read, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return nil, err
		}
		if attachment.Valid {
			v := attachment.String
			it.AttachmentURL = &v
		}
		out = append(out, &it)
	}
	return out, rows.Err()
}

func (r *Repository) ListMessagesByChannel(ctx context.Context, channel string, limit int) ([]*model.PatientMessage, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	qry := `SELECT id, patient_id, sender, channel, content, attachment_url, read, created_at, updated_at FROM patient_messages WHERE channel=$1 ORDER BY created_at DESC LIMIT $2`
	rows, err := r.db.QueryContext(ctx, qry, channel, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]*model.PatientMessage, 0)
	for rows.Next() {
		var it model.PatientMessage
		var attachment sql.NullString
		if err := rows.Scan(&it.ID, &it.PatientID, &it.Sender, &it.Channel, &it.Content, &attachment, &it.Read, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return nil, err
		}
		if attachment.Valid {
			v := attachment.String
			it.AttachmentURL = &v
		}
		out = append(out, &it)
	}
	return out, rows.Err()
}

func (r *Repository) CreateMessage(ctx context.Context, patientID, sender, channel, content string, attachmentURL *string) (*model.PatientMessage, error) {
	qry := `INSERT INTO patient_messages (tenant_id, patient_id, sender, channel, content, attachment_url) VALUES ((SELECT id FROM tenants WHERE slug='default'), $1, $2, $3, $4, $5) RETURNING id, patient_id, sender, channel, content, attachment_url, read, created_at, updated_at`
	var it model.PatientMessage
	var attachment sql.NullString
	if err := r.db.QueryRowContext(ctx, qry, patientID, sender, channel, content, attachmentURL).Scan(&it.ID, &it.PatientID, &it.Sender, &it.Channel, &it.Content, &attachment, &it.Read, &it.CreatedAt, &it.UpdatedAt); err != nil {
		return nil, err
	}
	if attachment.Valid {
		v := attachment.String
		it.AttachmentURL = &v
	}
	return &it, nil
}

func (r *Repository) ListDocumentsByPatient(ctx context.Context, patientID string, limit int) ([]*model.PatientDocument, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	qry := `SELECT id, patient_id, name, category, url, created_at, updated_at FROM patient_documents WHERE patient_id=$1 ORDER BY created_at DESC LIMIT $2`
	rows, err := r.db.QueryContext(ctx, qry, patientID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]*model.PatientDocument, 0)
	for rows.Next() {
		var it model.PatientDocument
		var url sql.NullString
		if err := rows.Scan(&it.ID, &it.PatientID, &it.Name, &it.Category, &url, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return nil, err
		}
		if url.Valid {
			v := url.String
			it.URL = &v
		}
		out = append(out, &it)
	}
	return out, rows.Err()
}

func (r *Repository) CreateDocument(ctx context.Context, patientID, name, category string, url *string) (*model.PatientDocument, error) {
	qry := `INSERT INTO patient_documents (tenant_id, patient_id, name, category, url) VALUES ((SELECT id FROM tenants WHERE slug='default'), $1, $2, $3, $4) RETURNING id, patient_id, name, category, url, created_at, updated_at`
	var it model.PatientDocument
	var outURL sql.NullString
	if err := r.db.QueryRowContext(ctx, qry, patientID, name, category, url).Scan(&it.ID, &it.PatientID, &it.Name, &it.Category, &outURL, &it.CreatedAt, &it.UpdatedAt); err != nil {
		return nil, err
	}
	if outURL.Valid {
		v := outURL.String
		it.URL = &v
	}
	return &it, nil
}

func (r *Repository) ListTelemedicineSessionsByPatient(ctx context.Context, patientID string, limit int) ([]*model.TelemedicineSession, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	qry := `SELECT id, patient_id, doctor_id, doctor_name, scheduled_at, preferred_mode, requested_amount, requested_currency, status, connection_status, notes, created_at, updated_at FROM patient_telemedicine_sessions WHERE patient_id=$1 ORDER BY scheduled_at DESC LIMIT $2`
	rows, err := r.db.QueryContext(ctx, qry, patientID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]*model.TelemedicineSession, 0)
	for rows.Next() {
		var it model.TelemedicineSession
		var doctorID sql.NullString
		var notes sql.NullString
		if err := rows.Scan(&it.ID, &it.PatientID, &doctorID, &it.DoctorName, &it.ScheduledAt, &it.PreferredMode, &it.RequestedAmount, &it.RequestedCurrency, &it.Status, &it.ConnectionStatus, &notes, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return nil, err
		}
		if doctorID.Valid {
			value := doctorID.String
			it.DoctorID = &value
		}
		if notes.Valid {
			v := notes.String
			it.Notes = &v
		}
		out = append(out, &it)
	}
	return out, rows.Err()
}

func (r *Repository) CreateTelemedicineSession(ctx context.Context, patientID string, doctorID *string, doctorName string, scheduledAt time.Time, preferredMode string, requestedAmount float64, requestedCurrency string, notes *string) (*model.TelemedicineSession, error) {
	qry := `INSERT INTO patient_telemedicine_sessions (tenant_id, patient_id, doctor_id, doctor_name, scheduled_at, preferred_mode, requested_amount, requested_currency, status, connection_status, notes) VALUES ((SELECT id FROM tenants WHERE slug='default'), $1, $2, $3, $4, $5, $6, $7, 'pending', 'waiting', $8) RETURNING id, patient_id, doctor_id, doctor_name, scheduled_at, preferred_mode, requested_amount, requested_currency, status, connection_status, notes, created_at, updated_at`
	var it model.TelemedicineSession
	var doctorIDOut sql.NullString
	var notesOut sql.NullString
	if err := r.db.QueryRowContext(ctx, qry, patientID, doctorID, doctorName, scheduledAt, preferredMode, requestedAmount, requestedCurrency, notes).Scan(&it.ID, &it.PatientID, &doctorIDOut, &it.DoctorName, &it.ScheduledAt, &it.PreferredMode, &it.RequestedAmount, &it.RequestedCurrency, &it.Status, &it.ConnectionStatus, &notesOut, &it.CreatedAt, &it.UpdatedAt); err != nil {
		return nil, err
	}
	if doctorIDOut.Valid {
		value := doctorIDOut.String
		it.DoctorID = &value
	}
	if notesOut.Valid {
		v := notesOut.String
		it.Notes = &v
	}
	return &it, nil
}

func (r *Repository) GetTelemedicineSessionByID(ctx context.Context, id string) (*model.TelemedicineSession, error) {
	qry := `SELECT id, patient_id, doctor_id, doctor_name, scheduled_at, preferred_mode, requested_amount, requested_currency, status, connection_status, notes, created_at, updated_at FROM patient_telemedicine_sessions WHERE id=$1`
	var it model.TelemedicineSession
	var doctorID sql.NullString
	var notes sql.NullString
	if err := r.db.QueryRowContext(ctx, qry, id).Scan(&it.ID, &it.PatientID, &doctorID, &it.DoctorName, &it.ScheduledAt, &it.PreferredMode, &it.RequestedAmount, &it.RequestedCurrency, &it.Status, &it.ConnectionStatus, &notes, &it.CreatedAt, &it.UpdatedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	if doctorID.Valid {
		value := doctorID.String
		it.DoctorID = &value
	}
	if notes.Valid {
		value := notes.String
		it.Notes = &value
	}
	return &it, nil
}

func (r *Repository) ListTelemedicineQueueByOrganization(ctx context.Context, organizationID string, limit int) ([]*model.TelemedicineSession, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	qry := `
		SELECT
			s.id,
			s.patient_id,
			s.doctor_id,
			COALESCE(d.full_name, s.doctor_name) AS doctor_name,
			s.scheduled_at,
			s.preferred_mode,
			s.requested_amount,
			s.requested_currency,
			s.status,
			s.connection_status,
			s.notes,
			s.created_at,
			s.updated_at
		FROM patient_telemedicine_sessions s
		LEFT JOIN users d ON d.id = s.doctor_id
		LEFT JOIN org_staff_profiles sp ON sp.user_id = s.doctor_id
		WHERE s.status IN ('pending', 'accepted', 'in_progress')
		  AND (s.doctor_id IS NULL OR sp.organization_id = $1)
		ORDER BY
			CASE s.status WHEN 'pending' THEN 0 WHEN 'accepted' THEN 1 ELSE 2 END,
			s.created_at ASC
		LIMIT $2
	`
	rows, err := r.db.QueryContext(ctx, qry, organizationID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]*model.TelemedicineSession, 0)
	for rows.Next() {
		var it model.TelemedicineSession
		var doctorID sql.NullString
		var notes sql.NullString
		if err := rows.Scan(&it.ID, &it.PatientID, &doctorID, &it.DoctorName, &it.ScheduledAt, &it.PreferredMode, &it.RequestedAmount, &it.RequestedCurrency, &it.Status, &it.ConnectionStatus, &notes, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return nil, err
		}
		if doctorID.Valid {
			value := doctorID.String
			it.DoctorID = &value
		}
		if notes.Valid {
			value := notes.String
			it.Notes = &value
		}
		out = append(out, &it)
	}
	return out, rows.Err()
}

func (r *Repository) AcceptTelemedicineSession(ctx context.Context, organizationID, sessionID, doctorID string) (*model.TelemedicineSession, error) {
	qry := `
		WITH doctor_ref AS (
			SELECT u.id, u.full_name
			FROM users u
			JOIN org_staff_profiles sp ON sp.user_id = u.id
			WHERE u.id = $3
			  AND sp.organization_id = $1
			  AND LOWER(COALESCE(sp.role, '')) IN ('doctor', 'nurse')
			  AND COALESCE(sp.telemedicine_enabled, FALSE) = TRUE
		), updated AS (
			UPDATE patient_telemedicine_sessions s
			SET
				doctor_id = doctor_ref.id,
				doctor_name = doctor_ref.full_name,
				status = 'accepted',
				connection_status = 'connecting',
				updated_at = NOW()
			FROM doctor_ref
			WHERE s.id = $2
			  AND s.status = 'pending'
			RETURNING s.id, s.patient_id, s.doctor_id, s.doctor_name, s.scheduled_at, s.preferred_mode, s.requested_amount, s.requested_currency, s.status, s.connection_status, s.notes, s.created_at, s.updated_at
		)
		SELECT id, patient_id, doctor_id, doctor_name, scheduled_at, preferred_mode, requested_amount, requested_currency, status, connection_status, notes, created_at, updated_at
		FROM updated
	`
	var it model.TelemedicineSession
	var doctorIDOut sql.NullString
	var notes sql.NullString
	if err := r.db.QueryRowContext(ctx, qry, organizationID, sessionID, doctorID).Scan(&it.ID, &it.PatientID, &doctorIDOut, &it.DoctorName, &it.ScheduledAt, &it.PreferredMode, &it.RequestedAmount, &it.RequestedCurrency, &it.Status, &it.ConnectionStatus, &notes, &it.CreatedAt, &it.UpdatedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	if doctorIDOut.Valid {
		value := doctorIDOut.String
		it.DoctorID = &value
	}
	if notes.Valid {
		value := notes.String
		it.Notes = &value
	}
	return &it, nil
}

func (r *Repository) MarkTelemedicineSessionInProgress(ctx context.Context, sessionID, doctorID string) (*model.TelemedicineSession, error) {
	qry := `
		UPDATE patient_telemedicine_sessions s
		SET
			doctor_id = CASE
				WHEN NULLIF($2, '') IS NULL THEN s.doctor_id
				ELSE COALESCE(s.doctor_id, $2::uuid)
			END,
			status = CASE WHEN s.status IN ('pending', 'accepted', 'in_progress') THEN 'in_progress' ELSE s.status END,
			connection_status = 'live',
			updated_at = NOW()
		WHERE s.id = $1
		  AND (NULLIF($2, '') IS NULL OR s.doctor_id IS NULL OR s.doctor_id = $2::uuid)
		RETURNING s.id, s.patient_id, s.doctor_id, s.doctor_name, s.scheduled_at, s.preferred_mode, s.requested_amount, s.requested_currency, s.status, s.connection_status, s.notes, s.created_at, s.updated_at
	`
	var it model.TelemedicineSession
	var doctorIDOut sql.NullString
	var notes sql.NullString
	if err := r.db.QueryRowContext(ctx, qry, sessionID, doctorID).Scan(&it.ID, &it.PatientID, &doctorIDOut, &it.DoctorName, &it.ScheduledAt, &it.PreferredMode, &it.RequestedAmount, &it.RequestedCurrency, &it.Status, &it.ConnectionStatus, &notes, &it.CreatedAt, &it.UpdatedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	if doctorIDOut.Valid {
		value := doctorIDOut.String
		it.DoctorID = &value
	}
	if notes.Valid {
		value := notes.String
		it.Notes = &value
	}
	return &it, nil
}

func (r *Repository) CreateTelemedicineArtifact(ctx context.Context, sessionID, patientID string, doctorID, recordingURL, transcriptURL *string, summary, finalDiagnosis string, symptoms []string, followUpNeeded bool) (*model.TelemedicineSessionArtifact, error) {
	symptomsJSON, err := json.Marshal(symptoms)
	if err != nil {
		return nil, err
	}
	qry := `INSERT INTO telemedicine_session_artifacts (tenant_id, session_id, patient_id, doctor_id, recording_url, transcript_url, summary, final_diagnosis, symptoms, follow_up_needed) VALUES ((SELECT id FROM tenants WHERE slug='default'), $1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9) RETURNING id, session_id, patient_id, doctor_id, recording_url, transcript_url, summary, final_diagnosis, symptoms, follow_up_needed, created_at, updated_at`
	var it model.TelemedicineSessionArtifact
	var outDoctorID sql.NullString
	var outRecordingURL sql.NullString
	var outTranscriptURL sql.NullString
	var symptomsRaw []byte
	if err := r.db.QueryRowContext(ctx, qry, sessionID, patientID, doctorID, recordingURL, transcriptURL, summary, finalDiagnosis, string(symptomsJSON), followUpNeeded).Scan(&it.ID, &it.SessionID, &it.PatientID, &outDoctorID, &outRecordingURL, &outTranscriptURL, &it.Summary, &it.FinalDiagnosis, &symptomsRaw, &it.FollowUpNeeded, &it.CreatedAt, &it.UpdatedAt); err != nil {
		return nil, err
	}
	if outDoctorID.Valid {
		value := outDoctorID.String
		it.DoctorID = &value
	}
	if outRecordingURL.Valid {
		value := outRecordingURL.String
		it.RecordingURL = &value
	}
	if outTranscriptURL.Valid {
		value := outTranscriptURL.String
		it.TranscriptURL = &value
	}
	_ = json.Unmarshal(symptomsRaw, &it.Symptoms)
	return &it, nil
}

func (r *Repository) ListPharmacyMedications(ctx context.Context, limit int) ([]*model.PharmacyMedication, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	qry := `SELECT id, name, COALESCE(dosage,''), COALESCE(quantity_label,''), price, currency, prescription_required, in_stock, created_at, updated_at FROM pharmacy_medications ORDER BY name ASC LIMIT $1`
	rows, err := r.db.QueryContext(ctx, qry, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]*model.PharmacyMedication, 0)
	for rows.Next() {
		var it model.PharmacyMedication
		if err := rows.Scan(&it.ID, &it.Name, &it.Dosage, &it.QuantityLabel, &it.Price, &it.Currency, &it.PrescriptionRequired, &it.InStock, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, &it)
	}
	return out, rows.Err()
}

func (r *Repository) ListPharmacies(ctx context.Context, limit int) ([]*model.PharmacyLocation, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	qry := `SELECT id, name, location, distance_km, eta_minutes, open_now, created_at, updated_at FROM pharmacies ORDER BY distance_km ASC LIMIT $1`
	rows, err := r.db.QueryContext(ctx, qry, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]*model.PharmacyLocation, 0)
	for rows.Next() {
		var it model.PharmacyLocation
		if err := rows.Scan(&it.ID, &it.Name, &it.Location, &it.DistanceKM, &it.ETAMinutes, &it.OpenNow, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, &it)
	}
	return out, rows.Err()
}

func (r *Repository) ListPharmacyOrdersByPatient(ctx context.Context, patientID string, limit int) ([]*model.PharmacyOrder, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	qry := `SELECT id, patient_id, medication_id, quantity, total_amount, currency, status, delivery_mode, created_at, updated_at FROM patient_pharmacy_orders WHERE patient_id=$1 ORDER BY created_at DESC LIMIT $2`
	rows, err := r.db.QueryContext(ctx, qry, patientID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]*model.PharmacyOrder, 0)
	for rows.Next() {
		var it model.PharmacyOrder
		var medicationID sql.NullString
		if err := rows.Scan(&it.ID, &it.PatientID, &medicationID, &it.Quantity, &it.TotalAmount, &it.Currency, &it.Status, &it.DeliveryMode, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return nil, err
		}
		if medicationID.Valid {
			v := medicationID.String
			it.MedicationID = &v
		}
		out = append(out, &it)
	}
	return out, rows.Err()
}

func (r *Repository) CreatePharmacyOrder(ctx context.Context, patientID string, medicationID *string, quantity int, total float64, currency, deliveryMode string) (*model.PharmacyOrder, error) {
	qry := `INSERT INTO patient_pharmacy_orders (tenant_id, patient_id, medication_id, quantity, total_amount, currency, delivery_mode) VALUES ((SELECT id FROM tenants WHERE slug='default'), $1, $2, $3, $4, $5, $6) RETURNING id, patient_id, medication_id, quantity, total_amount, currency, status, delivery_mode, created_at, updated_at`
	var it model.PharmacyOrder
	var outMedicationID sql.NullString
	if err := r.db.QueryRowContext(ctx, qry, patientID, medicationID, quantity, total, currency, deliveryMode).Scan(&it.ID, &it.PatientID, &outMedicationID, &it.Quantity, &it.TotalAmount, &it.Currency, &it.Status, &it.DeliveryMode, &it.CreatedAt, &it.UpdatedAt); err != nil {
		return nil, err
	}
	if outMedicationID.Valid {
		v := outMedicationID.String
		it.MedicationID = &v
	}
	return &it, nil
}

func (r *Repository) ListChronicCareByPatient(ctx context.Context, patientID string, limit int) ([]*model.ChronicCareRecord, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	qry := `SELECT id, patient_id, condition_name, care_plan, severity_level, risk_score, last_review_at, created_at, updated_at FROM patient_chronic_care WHERE patient_id=$1 ORDER BY created_at DESC LIMIT $2`
	rows, err := r.db.QueryContext(ctx, qry, patientID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]*model.ChronicCareRecord, 0)
	for rows.Next() {
		var it model.ChronicCareRecord
		var lastReview sql.NullTime
		if err := rows.Scan(&it.ID, &it.PatientID, &it.ConditionName, &it.CarePlan, &it.SeverityLevel, &it.RiskScore, &lastReview, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return nil, err
		}
		if lastReview.Valid {
			t := lastReview.Time
			it.LastReviewAt = &t
		}
		out = append(out, &it)
	}
	return out, rows.Err()
}

func (r *Repository) ListPregnancyCareByPatient(ctx context.Context, patientID string, limit int) ([]*model.PregnancyRecord, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	qry := `SELECT id, patient_id, trimester, expected_delivery_date, high_risk, notes, severity_level, created_at, updated_at FROM patient_pregnancy_care WHERE patient_id=$1 ORDER BY created_at DESC LIMIT $2`
	rows, err := r.db.QueryContext(ctx, qry, patientID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]*model.PregnancyRecord, 0)
	for rows.Next() {
		var it model.PregnancyRecord
		var edd sql.NullTime
		if err := rows.Scan(&it.ID, &it.PatientID, &it.Trimester, &edd, &it.HighRisk, &it.Notes, &it.SeverityLevel, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return nil, err
		}
		if edd.Valid {
			t := edd.Time
			it.ExpectedDeliveryDate = &t
		}
		out = append(out, &it)
	}
	return out, rows.Err()
}

func (r *Repository) ListRecurrentMedicationsByPatient(ctx context.Context, patientID string, limit int) ([]*model.RecurrentMedicationRecord, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	qry := `SELECT id, patient_id, medication_name, taken_today, adherence_percent, appointment_severity, medication_alert_severity, last_taken_at, diet_notes, created_at, updated_at FROM patient_recurrent_medications WHERE patient_id=$1 ORDER BY created_at DESC LIMIT $2`
	rows, err := r.db.QueryContext(ctx, qry, patientID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]*model.RecurrentMedicationRecord, 0)
	for rows.Next() {
		var it model.RecurrentMedicationRecord
		var lastTaken sql.NullTime
		if err := rows.Scan(&it.ID, &it.PatientID, &it.MedicationName, &it.TakenToday, &it.AdherencePercent, &it.AppointmentSeverity, &it.MedicationAlertSeverity, &lastTaken, &it.DietNotes, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return nil, err
		}
		if lastTaken.Valid {
			t := lastTaken.Time
			it.LastTakenAt = &t
		}
		out = append(out, &it)
	}
	return out, rows.Err()
}

func (r *Repository) GetAIConsentByPatient(ctx context.Context, patientID string) (*model.AIUserConsent, error) {
	qry := `SELECT id, patient_id, allow_learning, allow_summaries, allow_analytics, updated_by, created_at, updated_at FROM ai_user_consents WHERE patient_id=$1`
	var it model.AIUserConsent
	if err := r.db.QueryRowContext(ctx, qry, patientID).Scan(&it.ID, &it.PatientID, &it.AllowLearning, &it.AllowSummaries, &it.AllowAnalytics, &it.UpdatedBy, &it.CreatedAt, &it.UpdatedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &it, nil
}

func (r *Repository) UpsertAIConsent(ctx context.Context, patientID string, allowLearning, allowSummaries, allowAnalytics bool, updatedBy string) (*model.AIUserConsent, error) {
	qry := `
		INSERT INTO ai_user_consents (tenant_id, patient_id, allow_learning, allow_summaries, allow_analytics, updated_by)
		VALUES ((SELECT id FROM tenants WHERE slug='default'), $1, $2, $3, $4, $5)
		ON CONFLICT (patient_id)
		DO UPDATE SET allow_learning=$2, allow_summaries=$3, allow_analytics=$4, updated_by=$5, updated_at=NOW()
		RETURNING id, patient_id, allow_learning, allow_summaries, allow_analytics, updated_by, created_at, updated_at
	`
	var it model.AIUserConsent
	if err := r.db.QueryRowContext(ctx, qry, patientID, allowLearning, allowSummaries, allowAnalytics, updatedBy).Scan(&it.ID, &it.PatientID, &it.AllowLearning, &it.AllowSummaries, &it.AllowAnalytics, &it.UpdatedBy, &it.CreatedAt, &it.UpdatedAt); err != nil {
		return nil, err
	}
	return &it, nil
}

func (r *Repository) ListAIModels(ctx context.Context) ([]*model.AIModel, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT id, model_key, display_name, mode, status, version, dataset_ref, created_at, updated_at FROM ai_models ORDER BY mode, model_key`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]*model.AIModel, 0)
	for rows.Next() {
		var it model.AIModel
		if err := rows.Scan(&it.ID, &it.ModelKey, &it.DisplayName, &it.Mode, &it.Status, &it.Version, &it.DatasetRef, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, &it)
	}
	return out, rows.Err()
}

func (r *Repository) SetAIModelStatus(ctx context.Context, modelKey, status string) (*model.AIModel, error) {
	qry := `UPDATE ai_models SET status=$2, updated_at=NOW() WHERE model_key=$1 RETURNING id, model_key, display_name, mode, status, version, dataset_ref, created_at, updated_at`
	var it model.AIModel
	if err := r.db.QueryRowContext(ctx, qry, modelKey, status).Scan(&it.ID, &it.ModelKey, &it.DisplayName, &it.Mode, &it.Status, &it.Version, &it.DatasetRef, &it.CreatedAt, &it.UpdatedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &it, nil
}

func (r *Repository) InsertAILearningSample(ctx context.Context, patientID, mode, sampleType string, payload map[string]any, consentApplied bool) (*model.AILearningSample, error) {
	payloadJSON, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	qry := `INSERT INTO ai_learning_samples (tenant_id, patient_id, mode, sample_type, payload, consent_applied) VALUES ((SELECT id FROM tenants WHERE slug='default'), $1, $2, $3, $4::jsonb, $5) RETURNING id, patient_id, mode, sample_type, payload, consent_applied, created_at, updated_at`
	var it model.AILearningSample
	var payloadRaw []byte
	if err := r.db.QueryRowContext(ctx, qry, patientID, mode, sampleType, string(payloadJSON), consentApplied).Scan(&it.ID, &it.PatientID, &it.Mode, &it.SampleType, &payloadRaw, &it.ConsentApplied, &it.CreatedAt, &it.UpdatedAt); err != nil {
		return nil, err
	}
	_ = json.Unmarshal(payloadRaw, &it.Payload)
	return &it, nil
}

func (r *Repository) ListTelemedicineArtifactsByPatient(ctx context.Context, patientID string, limit int) ([]*model.TelemedicineSessionArtifact, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	qry := `SELECT id, session_id, patient_id, doctor_id, recording_url, transcript_url, summary, final_diagnosis, symptoms, follow_up_needed, created_at, updated_at FROM telemedicine_session_artifacts WHERE patient_id=$1 ORDER BY created_at DESC LIMIT $2`
	rows, err := r.db.QueryContext(ctx, qry, patientID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]*model.TelemedicineSessionArtifact, 0)
	for rows.Next() {
		var it model.TelemedicineSessionArtifact
		var doctorID sql.NullString
		var recordingURL sql.NullString
		var transcriptURL sql.NullString
		var symptomsRaw []byte
		if err := rows.Scan(&it.ID, &it.SessionID, &it.PatientID, &doctorID, &recordingURL, &transcriptURL, &it.Summary, &it.FinalDiagnosis, &symptomsRaw, &it.FollowUpNeeded, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return nil, err
		}
		if doctorID.Valid {
			v := doctorID.String
			it.DoctorID = &v
		}
		if recordingURL.Valid {
			v := recordingURL.String
			it.RecordingURL = &v
		}
		if transcriptURL.Valid {
			v := transcriptURL.String
			it.TranscriptURL = &v
		}
		_ = json.Unmarshal(symptomsRaw, &it.Symptoms)
		out = append(out, &it)
	}
	return out, rows.Err()
}

func (r *Repository) ListTelemedicineArtifactsForOrg(ctx context.Context, limit int) ([]*model.TelemedicineSessionArtifact, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	qry := `SELECT id, session_id, patient_id, doctor_id, recording_url, transcript_url, summary, final_diagnosis, symptoms, follow_up_needed, created_at, updated_at FROM telemedicine_session_artifacts ORDER BY created_at DESC LIMIT $1`
	rows, err := r.db.QueryContext(ctx, qry, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]*model.TelemedicineSessionArtifact, 0)
	for rows.Next() {
		var it model.TelemedicineSessionArtifact
		var doctorID sql.NullString
		var recordingURL sql.NullString
		var transcriptURL sql.NullString
		var symptomsRaw []byte
		if err := rows.Scan(&it.ID, &it.SessionID, &it.PatientID, &doctorID, &recordingURL, &transcriptURL, &it.Summary, &it.FinalDiagnosis, &symptomsRaw, &it.FollowUpNeeded, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return nil, err
		}
		if doctorID.Valid {
			v := doctorID.String
			it.DoctorID = &v
		}
		if recordingURL.Valid {
			v := recordingURL.String
			it.RecordingURL = &v
		}
		if transcriptURL.Valid {
			v := transcriptURL.String
			it.TranscriptURL = &v
		}
		_ = json.Unmarshal(symptomsRaw, &it.Symptoms)
		out = append(out, &it)
	}
	return out, rows.Err()
}

func (r *Repository) CreateTelemedicineTranscriptLine(ctx context.Context, sessionID, patientID, speaker, source, content string, occurredAt *time.Time) (*model.TelemedicineTranscriptLine, error) {
	if source == "" {
		source = "manual"
	}
	qry := `
		INSERT INTO telemedicine_transcript_lines (
			tenant_id,
			session_id,
			patient_id,
			speaker,
			source,
			content,
			occurred_at
		)
		VALUES (
			(SELECT id FROM tenants WHERE slug='default'),
			$1,
			$2,
			$3,
			$4,
			$5,
			COALESCE($6, NOW())
		)
		RETURNING id, session_id, patient_id, speaker, source, content, occurred_at, created_at, updated_at
	`
	var item model.TelemedicineTranscriptLine
	if err := r.db.QueryRowContext(ctx, qry, sessionID, patientID, speaker, source, content, occurredAt).Scan(
		&item.ID,
		&item.SessionID,
		&item.PatientID,
		&item.Speaker,
		&item.Source,
		&item.Content,
		&item.OccurredAt,
		&item.CreatedAt,
		&item.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *Repository) ListTelemedicineTranscriptLinesBySession(ctx context.Context, sessionID string, limit int) ([]*model.TelemedicineTranscriptLine, error) {
	if limit <= 0 || limit > 1000 {
		limit = 300
	}
	qry := `
		SELECT id, session_id, patient_id, speaker, source, content, occurred_at, created_at, updated_at
		FROM telemedicine_transcript_lines
		WHERE session_id = $1
		ORDER BY occurred_at ASC, created_at ASC
		LIMIT $2
	`
	rows, err := r.db.QueryContext(ctx, qry, sessionID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]*model.TelemedicineTranscriptLine, 0)
	for rows.Next() {
		var item model.TelemedicineTranscriptLine
		if err := rows.Scan(
			&item.ID,
			&item.SessionID,
			&item.PatientID,
			&item.Speaker,
			&item.Source,
			&item.Content,
			&item.OccurredAt,
			&item.CreatedAt,
			&item.UpdatedAt,
		); err != nil {
			return nil, err
		}
		out = append(out, &item)
	}
	return out, rows.Err()
}

func (r *Repository) CreateOrgDoctor(ctx context.Context, fullName, email, specialty, licenseNumber string) (map[string]any, error) {
	qry := `INSERT INTO org_doctors (tenant_id, organization_id, full_name, email, specialty, license_number, verified) VALUES ((SELECT id FROM tenants WHERE slug='default'), (SELECT id FROM organizations WHERE slug='default-org'), $1, $2, $3, $4, true) RETURNING id, full_name, email, specialty, license_number, verified, created_at`
	var id string
	var name string
	var outEmail string
	var outSpecialty string
	var outLicense string
	var verified bool
	var createdAt time.Time
	if err := r.db.QueryRowContext(ctx, qry, fullName, email, specialty, licenseNumber).Scan(&id, &name, &outEmail, &outSpecialty, &outLicense, &verified, &createdAt); err != nil {
		return nil, err
	}
	return map[string]any{
		"id":             id,
		"full_name":      name,
		"email":          outEmail,
		"specialty":      outSpecialty,
		"license_number": outLicense,
		"verified":       verified,
		"created_at":     createdAt,
	}, nil
}

func (r *Repository) ListOrgDoctors(ctx context.Context, limit int) ([]map[string]any, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	rows, err := r.db.QueryContext(ctx, `SELECT id, full_name, email, specialty, license_number, verified, created_at FROM org_doctors ORDER BY created_at DESC LIMIT $1`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]map[string]any, 0)
	for rows.Next() {
		var id, name, email, specialty, license string
		var verified bool
		var createdAt time.Time
		if err := rows.Scan(&id, &name, &email, &specialty, &license, &verified, &createdAt); err != nil {
			return nil, err
		}
		out = append(out, map[string]any{
			"id":             id,
			"full_name":      name,
			"email":          email,
			"specialty":      specialty,
			"license_number": license,
			"verified":       verified,
			"created_at":     createdAt,
		})
	}
	return out, rows.Err()
}

func (r *Repository) CreateOrgPharmacy(ctx context.Context, name, location string) (map[string]any, error) {
	qry := `INSERT INTO pharmacies (tenant_id, name, location, distance_km, eta_minutes, open_now) VALUES ((SELECT id FROM tenants WHERE slug='default'), $1, $2, 1.0, 30, true) RETURNING id, name, location, distance_km, eta_minutes, open_now, created_at`
	var id string
	var outName string
	var outLocation string
	var distanceKM float64
	var etaMinutes int
	var openNow bool
	var createdAt time.Time
	if err := r.db.QueryRowContext(ctx, qry, name, location).Scan(&id, &outName, &outLocation, &distanceKM, &etaMinutes, &openNow, &createdAt); err != nil {
		return nil, err
	}
	return map[string]any{
		"id":          id,
		"name":        outName,
		"location":    outLocation,
		"distance_km": distanceKM,
		"eta_minutes": etaMinutes,
		"open_now":    openNow,
		"created_at":  createdAt,
	}, nil
}

func (r *Repository) ListOrgPharmacies(ctx context.Context, limit int) ([]map[string]any, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	rows, err := r.db.QueryContext(ctx, `SELECT id, name, location, distance_km, eta_minutes, open_now, created_at FROM pharmacies ORDER BY created_at DESC LIMIT $1`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]map[string]any, 0)
	for rows.Next() {
		var id, name, location string
		var distanceKM float64
		var etaMinutes int
		var openNow bool
		var createdAt time.Time
		if err := rows.Scan(&id, &name, &location, &distanceKM, &etaMinutes, &openNow, &createdAt); err != nil {
			return nil, err
		}
		out = append(out, map[string]any{
			"id":          id,
			"name":        name,
			"location":    location,
			"distance_km": distanceKM,
			"eta_minutes": etaMinutes,
			"open_now":    openNow,
			"created_at":  createdAt,
		})
	}
	return out, rows.Err()
}
