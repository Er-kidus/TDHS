package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/tenadam/api-gateway/internal/model"
)

type serviceRow struct {
	ID                  string
	TenantID            sql.NullString
	Name                string
	Description         sql.NullString
	ServiceCategory     string
	ServiceType         string
	Active              bool
	DurationMinutes     int
	BufferBeforeMinutes int
	BufferAfterMinutes  int
	RequiresAppointment bool
	AllowsWalkin        bool
	RequiresCheckin     bool
	SupportsRecurrence  bool
	AllowedPatternsJSON string
	MaxOccurrences      sql.NullInt32
	CreatedAt           sql.NullTime
	UpdatedAt           sql.NullTime
}

func (r *Repository) ListServices(ctx context.Context) ([]*model.ServiceDefinition, error) {
	qry := `
		SELECT id, tenant_id, name, description, service_category, service_type, active,
			duration_minutes, buffer_before_minutes, buffer_after_minutes,
			requires_appointment, allows_walkin, requires_checkin,
			supports_recurrence, allowed_patterns::text, max_occurrences,
			created_at, updated_at
		FROM services
		ORDER BY name ASC
	`
	rows, err := r.db.QueryContext(ctx, qry)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []*model.ServiceDefinition
	for rows.Next() {
		var row serviceRow
		if err := rows.Scan(
			&row.ID, &row.TenantID, &row.Name, &row.Description, &row.ServiceCategory, &row.ServiceType, &row.Active,
			&row.DurationMinutes, &row.BufferBeforeMinutes, &row.BufferAfterMinutes,
			&row.RequiresAppointment, &row.AllowsWalkin, &row.RequiresCheckin,
			&row.SupportsRecurrence, &row.AllowedPatternsJSON, &row.MaxOccurrences,
			&row.CreatedAt, &row.UpdatedAt,
		); err != nil {
			return nil, err
		}
		out = append(out, toServiceModel(&row))
	}
	return out, rows.Err()
}

func (r *Repository) CreateService(ctx context.Context, req *model.ServiceDefinition) (*model.ServiceDefinition, error) {
	qry := `
		INSERT INTO services (
			tenant_id, name, description, service_category, service_type, active,
			duration_minutes, buffer_before_minutes, buffer_after_minutes,
			requires_appointment, allows_walkin, requires_checkin,
			supports_recurrence, allowed_patterns, max_occurrences
		)
		VALUES (
			(SELECT id FROM tenants WHERE slug='default'),
			$1, $2, $3, $4, COALESCE($5, true),
			$6, $7, $8,
			COALESCE($9, true), COALESCE($10, true), COALESCE($11, true),
			COALESCE($12, false), COALESCE($13::jsonb, '[]'::jsonb), $14
		)
		RETURNING id, tenant_id, name, description, service_category, service_type, active,
			duration_minutes, buffer_before_minutes, buffer_after_minutes,
			requires_appointment, allows_walkin, requires_checkin,
			supports_recurrence, allowed_patterns::text, max_occurrences,
			created_at, updated_at
	`
	var row serviceRow
	if err := r.db.QueryRowContext(
		ctx,
		qry,
		req.Name,
		req.Description,
		req.ServiceCategory,
		req.ServiceType,
		req.Active,
		req.DurationMinutes,
		req.BufferBeforeMinutes,
		req.BufferAfterMinutes,
		req.RequiresAppointment,
		req.AllowsWalkin,
		req.RequiresCheckin,
		req.SupportsRecurrence,
		req.AllowedPatternsJSON,
		req.MaxOccurrences,
	).Scan(
		&row.ID, &row.TenantID, &row.Name, &row.Description, &row.ServiceCategory, &row.ServiceType, &row.Active,
		&row.DurationMinutes, &row.BufferBeforeMinutes, &row.BufferAfterMinutes,
		&row.RequiresAppointment, &row.AllowsWalkin, &row.RequiresCheckin,
		&row.SupportsRecurrence, &row.AllowedPatternsJSON, &row.MaxOccurrences,
		&row.CreatedAt, &row.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return toServiceModel(&row), nil
}

func (r *Repository) UpdateService(ctx context.Context, id string, req *model.ServiceDefinition) (*model.ServiceDefinition, error) {
	qry := `
		UPDATE services
		SET name = COALESCE($2, name),
			description = COALESCE($3, description),
			service_category = COALESCE($4, service_category),
			service_type = COALESCE($5, service_type),
			active = COALESCE($6, active),
			duration_minutes = COALESCE($7, duration_minutes),
			buffer_before_minutes = COALESCE($8, buffer_before_minutes),
			buffer_after_minutes = COALESCE($9, buffer_after_minutes),
			requires_appointment = COALESCE($10, requires_appointment),
			allows_walkin = COALESCE($11, allows_walkin),
			requires_checkin = COALESCE($12, requires_checkin),
			supports_recurrence = COALESCE($13, supports_recurrence),
			allowed_patterns = COALESCE($14::jsonb, allowed_patterns),
			max_occurrences = COALESCE($15, max_occurrences),
			updated_at = NOW()
		WHERE id=$1
		RETURNING id, tenant_id, name, description, service_category, service_type, active,
			duration_minutes, buffer_before_minutes, buffer_after_minutes,
			requires_appointment, allows_walkin, requires_checkin,
			supports_recurrence, allowed_patterns::text, max_occurrences,
			created_at, updated_at
	`
	var row serviceRow
	if err := r.db.QueryRowContext(
		ctx,
		qry,
		id,
		req.Name,
		req.Description,
		req.ServiceCategory,
		req.ServiceType,
		req.Active,
		req.DurationMinutes,
		req.BufferBeforeMinutes,
		req.BufferAfterMinutes,
		req.RequiresAppointment,
		req.AllowsWalkin,
		req.RequiresCheckin,
		req.SupportsRecurrence,
		req.AllowedPatternsJSON,
		req.MaxOccurrences,
	).Scan(
		&row.ID, &row.TenantID, &row.Name, &row.Description, &row.ServiceCategory, &row.ServiceType, &row.Active,
		&row.DurationMinutes, &row.BufferBeforeMinutes, &row.BufferAfterMinutes,
		&row.RequiresAppointment, &row.AllowsWalkin, &row.RequiresCheckin,
		&row.SupportsRecurrence, &row.AllowedPatternsJSON, &row.MaxOccurrences,
		&row.CreatedAt, &row.UpdatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return toServiceModel(&row), nil
}

func (r *Repository) DeleteService(ctx context.Context, id string) error {
	res, err := r.db.ExecContext(ctx, `DELETE FROM services WHERE id=$1`, id)
	if err != nil {
		return err
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *Repository) ListResources(ctx context.Context) ([]*model.ResourcePool, error) {
	qry := `
		SELECT id, tenant_id, type, category, label, status, facility_id, availability_schedule::text, created_at, updated_at
		FROM resources
		ORDER BY type, category, label
	`
	rows, err := r.db.QueryContext(ctx, qry)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]*model.ResourcePool, 0)
	for rows.Next() {
		var item model.ResourcePool
		var tenantID sql.NullString
		var facilityID sql.NullString
		if err := rows.Scan(&item.ID, &tenantID, &item.Type, &item.Category, &item.Label, &item.Status, &facilityID, &item.AvailabilityJSON, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		if tenantID.Valid {
			item.TenantID = &tenantID.String
		}
		if facilityID.Valid {
			item.FacilityID = &facilityID.String
		}
		out = append(out, &item)
	}
	return out, rows.Err()
}

func (r *Repository) AssignResources(ctx context.Context, appointmentID, staffType, room, equipment *string) (*model.Appointment, error) {
	return r.UpdateAppointment(ctx, *appointmentID, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, staffType, room, equipment)
}

func (r *Repository) UpsertQueueEntryForAppointment(ctx context.Context, appointmentID string) error {
	qry := `
		WITH appointment_info AS (
			SELECT id, service_type, facility_name, priority
			FROM appointments WHERE id=$1
		), queue_row AS (
			INSERT INTO queues (service_type, facility, status)
			SELECT COALESCE(service_type, 'general_consultation'), COALESCE(facility_name, 'default-facility'), 'active'
			FROM appointment_info
			ON CONFLICT (service_type, facility)
			DO UPDATE SET updated_at = NOW()
			RETURNING id
		), picked_queue AS (
			SELECT id FROM queue_row
			UNION ALL
			SELECT q.id FROM queues q
			JOIN appointment_info a ON q.service_type = COALESCE(a.service_type, 'general_consultation') AND q.facility = COALESCE(a.facility_name, 'default-facility')
			LIMIT 1
		), next_pos AS (
			SELECT COALESCE(MAX(position), 0) + 1 AS pos
			FROM queue_entries
			WHERE queue_id = (SELECT id FROM picked_queue)
		)
		INSERT INTO queue_entries (queue_id, appointment_id, position, status, estimated_wait_minutes)
		SELECT (SELECT id FROM picked_queue), $1, (SELECT pos FROM next_pos), 'waiting', ((SELECT pos FROM next_pos) - 1) * 10
		ON CONFLICT (queue_id, appointment_id)
		DO UPDATE SET updated_at = NOW(), status = EXCLUDED.status;
	`
	_, err := r.db.ExecContext(ctx, qry, appointmentID)
	return err
}

func (r *Repository) ReorderQueue(ctx context.Context, queueID string, orderedAppointmentIDs []string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	for i, appointmentID := range orderedAppointmentIDs {
		if _, err = tx.ExecContext(ctx,
			`UPDATE queue_entries SET position=$3, estimated_wait_minutes=($3-1)*10, updated_at=NOW() WHERE queue_id=$1 AND appointment_id=$2`,
			queueID,
			appointmentID,
			i+1,
		); err != nil {
			return err
		}
	}
	if err = tx.Commit(); err != nil {
		return err
	}
	return nil
}

func (r *Repository) ListQueueEntries(ctx context.Context) ([]*model.QueueEntry, error) {
	qry := `
		SELECT qe.queue_id, q.service_type, q.facility, qe.appointment_id, qe.position, qe.status, qe.estimated_wait_minutes
		FROM queue_entries qe
		JOIN queues q ON q.id = qe.queue_id
		JOIN appointments a ON a.id = qe.appointment_id
		WHERE a.status NOT IN ('fulfilled', 'cancelled')
		ORDER BY q.service_type, q.facility, qe.position ASC
	`
	rows, err := r.db.QueryContext(ctx, qry)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]*model.QueueEntry, 0)
	for rows.Next() {
		var item model.QueueEntry
		var facility sql.NullString
		if err := rows.Scan(&item.QueueID, &item.QueueServiceType, &facility, &item.AppointmentID, &item.Position, &item.Status, &item.EstimatedWaitMinutes); err != nil {
			return nil, err
		}
		if facility.Valid {
			item.QueueFacility = &facility.String
		}
		out = append(out, &item)
	}
	return out, rows.Err()
}

func toServiceModel(row *serviceRow) *model.ServiceDefinition {
	var tenantID *string
	if row.TenantID.Valid {
		tenantID = &row.TenantID.String
	}
	var desc *string
	if row.Description.Valid {
		desc = &row.Description.String
	}
	var maxOcc *int
	if row.MaxOccurrences.Valid {
		v := int(row.MaxOccurrences.Int32)
		maxOcc = &v
	}
	var createdAt, updatedAt model.Base
	_ = createdAt
	_ = updatedAt
	item := &model.ServiceDefinition{
		Base:                model.Base{ID: row.ID},
		TenantID:            tenantID,
		Name:                row.Name,
		Description:         desc,
		ServiceCategory:     row.ServiceCategory,
		ServiceType:         row.ServiceType,
		Active:              row.Active,
		DurationMinutes:     row.DurationMinutes,
		BufferBeforeMinutes: row.BufferBeforeMinutes,
		BufferAfterMinutes:  row.BufferAfterMinutes,
		RequiresAppointment: row.RequiresAppointment,
		AllowsWalkin:        row.AllowsWalkin,
		RequiresCheckin:     row.RequiresCheckin,
		SupportsRecurrence:  row.SupportsRecurrence,
		AllowedPatternsJSON: row.AllowedPatternsJSON,
		MaxOccurrences:      maxOcc,
	}
	if row.CreatedAt.Valid {
		item.Base.CreatedAt = row.CreatedAt.Time
	}
	if row.UpdatedAt.Valid {
		item.Base.UpdatedAt = row.UpdatedAt.Time
	}
	return item
}
