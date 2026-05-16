package repository

import (
	"context"
	"database/sql"
	"time"

	"github.com/tenadam/api-gateway/internal/model"
)

// ─── Visit Summaries ──────────────────────────────────────────────────────────

func (r *Repository) ListVisitSummariesByPatient(ctx context.Context, patientID string, limit int) ([]*model.VisitSummary, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	qry := `
		SELECT
			vs.id,
			vs.appointment_id,
			vs.patient_id,
			vs.summary,
			vs.disposition,
			a.service_type,
			a.facility_name,
			a.scheduled_at::text,
			vs.created_at
		FROM doctor_visit_summaries vs
		LEFT JOIN appointments a ON a.id = vs.appointment_id
		WHERE vs.patient_id = $1
		ORDER BY vs.created_at DESC
		LIMIT $2
	`
	rows, err := r.db.QueryContext(ctx, qry, patientID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]*model.VisitSummary, 0)
	for rows.Next() {
		var v model.VisitSummary
		var serviceType, facilityName, scheduledAt sql.NullString
		if err := rows.Scan(
			&v.ID, &v.AppointmentID, &v.PatientID,
			&v.Summary, &v.Disposition,
			&serviceType, &facilityName, &scheduledAt,
			&v.CreatedAt,
		); err != nil {
			return nil, err
		}
		if serviceType.Valid {
			v.ServiceType = &serviceType.String
		}
		if facilityName.Valid {
			v.FacilityName = &facilityName.String
		}
		if scheduledAt.Valid {
			v.ScheduledAt = &scheduledAt.String
		}
		out = append(out, &v)
	}
	return out, rows.Err()
}

// ─── Lab Orders ───────────────────────────────────────────────────────────────

func (r *Repository) ListLabOrdersByPatient(ctx context.Context, patientID string, limit int) ([]*model.LabOrder, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	qry := `
		SELECT
			id, appointment_id, patient_id, patient_name, order_id,
			service_area, test_name,
			indication, priority, status, verification_status,
			sample_label, result_value, result_notes,
			result_entered_at, critical_alert, acknowledged_by_doctor,
			confirmed_at, created_at, updated_at
		FROM lab_orders
		WHERE patient_id = $1
		ORDER BY created_at DESC
		LIMIT $2
	`
	rows, err := r.db.QueryContext(ctx, qry, patientID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]*model.LabOrder, 0)
	for rows.Next() {
		var o model.LabOrder
		var indication, sampleLabel, resultValue, resultNotes sql.NullString
		var resultEnteredAt, confirmedAt sql.NullTime
		if err := rows.Scan(
			&o.ID, &o.AppointmentID, &o.PatientID, &o.PatientName, &o.OrderID,
			&o.ServiceArea, &o.TestName,
			&indication, &o.Priority, &o.Status, &o.VerificationStatus,
			&sampleLabel, &resultValue, &resultNotes,
			&resultEnteredAt, &o.CriticalAlert, &o.AcknowledgedByDoctor,
			&confirmedAt, &o.CreatedAt, &o.UpdatedAt,
		); err != nil {
			return nil, err
		}
		if indication.Valid {
			o.Indication = &indication.String
		}
		if sampleLabel.Valid {
			o.SampleLabel = &sampleLabel.String
		}
		if resultValue.Valid {
			o.ResultValue = &resultValue.String
		}
		if resultNotes.Valid {
			o.ResultNotes = &resultNotes.String
		}
		if resultEnteredAt.Valid {
			t := resultEnteredAt.Time
			o.ResultEnteredAt = &t
		}
		if confirmedAt.Valid {
			t := confirmedAt.Time
			o.ConfirmedAt = &t
		}
		out = append(out, &o)
	}
	return out, rows.Err()
}

// ─── Doctor Prescriptions ─────────────────────────────────────────────────────

func (r *Repository) ListDoctorPrescriptionsByPatient(ctx context.Context, patientID string, limit int) ([]*model.DoctorPrescription, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	qry := `
		SELECT
			id, appointment_id, patient_id,
			medication, dosage, frequency, duration_days,
			instructions, status, created_at, updated_at
		FROM doctor_prescriptions
		WHERE patient_id = $1
		ORDER BY created_at DESC
		LIMIT $2
	`
	rows, err := r.db.QueryContext(ctx, qry, patientID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]*model.DoctorPrescription, 0)
	for rows.Next() {
		var p model.DoctorPrescription
		var instructions sql.NullString
		if err := rows.Scan(
			&p.ID, &p.AppointmentID, &p.PatientID,
			&p.Medication, &p.Dosage, &p.Frequency, &p.DurationDays,
			&instructions, &p.Status, &p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			return nil, err
		}
		if instructions.Valid {
			p.Instructions = &instructions.String
		}
		out = append(out, &p)
	}
	return out, rows.Err()
}

// ─── Conflict Check ───────────────────────────────────────────────────────────

// CheckAppointmentConflict returns true if the patient already has an appointment
// within ±2 hours of the requested time (excluding cancelled/fulfilled ones).
func (r *Repository) CheckAppointmentConflict(ctx context.Context, patientID string, scheduledAt time.Time) (bool, error) {
	qry := `
		SELECT COUNT(*) FROM appointments
		WHERE patient_id = $1
		  AND status NOT IN ('cancelled', 'fulfilled', 'noshow')
		  AND ABS(EXTRACT(EPOCH FROM (scheduled_at - $2))) < 7200
	`
	var count int
	if err := r.db.QueryRowContext(ctx, qry, patientID, scheduledAt).Scan(&count); err != nil {
		return false, err
	}
	return count > 0, nil
}
