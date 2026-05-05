package repository

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/tenadam/api-gateway/internal/model"
)

type appointmentRow struct {
	ID                       string
	TenantID                 sql.NullString
	PatientID                string
	CreatedBy                sql.NullString
	ScheduledAt              time.Time
	Status                   string
	Reason                   sql.NullString
	Notes                    sql.NullString
	Description              sql.NullString
	Priority                 sql.NullString
	AppointmentType          sql.NullString
	ServiceType              sql.NullString
	ServiceCategory          sql.NullString
	FacilityID               sql.NullString
	FacilityName             sql.NullString
	FacilityAddress          sql.NullString
	NearbyHospitalID         sql.NullString
	NearbyHospitalName       sql.NullString
	NearbyHospitalAddress    sql.NullString
	NearbyHospitalDistanceKm sql.NullFloat64
	Location                 sql.NullString
	AssignedStaffType        sql.NullString
	AssignedRoom             sql.NullString
	AssignedEquipment        sql.NullString
	CreatedAt                time.Time
	UpdatedAt                time.Time
}

func (r *Repository) CreateAppointment(
	ctx context.Context,
	patientID string,
	createdBy *string,
	scheduledAt time.Time,
	reason *string,
	notes *string,
	description *string,
	priority *string,
	appointmentType *string,
	serviceType *string,
	serviceCategory *string,
	facilityID *string,
	facilityName *string,
	facilityAddress *string,
	nearbyHospitalID *string,
	nearbyHospitalName *string,
	nearbyHospitalAddress *string,
	nearbyHospitalDistanceKm *float64,
	location *string,
) (*model.Appointment, error) {
	qry := `
		INSERT INTO appointments (
			tenant_id, patient_id, created_by, scheduled_at, reason, notes, description,
			priority, appointment_type, service_type, service_category,
			facility_id, facility_name, facility_address,
			nearby_hospital_id, nearby_hospital_name, nearby_hospital_address, nearby_hospital_distance_km,
			location
		)
		VALUES (
			(SELECT id FROM tenants WHERE slug='default'),
			$1, $2, $3, $4, $5, $6,
			COALESCE($7, 'routine'), COALESCE($8, 'in-person'), $9, $10,
			$11, $12, $13, $14, $15, $16, $17, $18
		)
		RETURNING id, tenant_id, patient_id, created_by, scheduled_at, status, reason, notes,
			description, priority, appointment_type, service_type, service_category,
			facility_id, facility_name, facility_address,
			nearby_hospital_id, nearby_hospital_name, nearby_hospital_address, nearby_hospital_distance_km,
			location,
			assigned_staff_type, assigned_room, assigned_equipment,
			created_at, updated_at
	`
	var createdByVal any
	if createdBy != nil {
		createdByVal = *createdBy
	}
	var row appointmentRow
	if err := r.db.QueryRowContext(
		ctx,
		qry,
		patientID,
		createdByVal,
		scheduledAt,
		reason,
		notes,
		description,
		priority,
		appointmentType,
		serviceType,
		serviceCategory,
		facilityID,
		facilityName,
		facilityAddress,
		nearbyHospitalID,
		nearbyHospitalName,
		nearbyHospitalAddress,
		nearbyHospitalDistanceKm,
		location,
	).Scan(
		&row.ID, &row.TenantID, &row.PatientID, &row.CreatedBy, &row.ScheduledAt, &row.Status, &row.Reason, &row.Notes,
		&row.Description, &row.Priority, &row.AppointmentType, &row.ServiceType, &row.ServiceCategory,
		&row.FacilityID, &row.FacilityName, &row.FacilityAddress,
		&row.NearbyHospitalID, &row.NearbyHospitalName, &row.NearbyHospitalAddress, &row.NearbyHospitalDistanceKm,
		&row.Location,
		&row.AssignedStaffType, &row.AssignedRoom, &row.AssignedEquipment,
		&row.CreatedAt, &row.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return toAppointmentModel(&row), nil
}

func (r *Repository) ListAppointmentsForPatient(ctx context.Context, patientID string, limit int) ([]*model.Appointment, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	qry := `
		SELECT id, tenant_id, patient_id, created_by, scheduled_at, status, reason, notes,
			description, priority, appointment_type, service_type, service_category,
			facility_id, facility_name, facility_address,
			nearby_hospital_id, nearby_hospital_name, nearby_hospital_address, nearby_hospital_distance_km,
			location,
			assigned_staff_type, assigned_room, assigned_equipment,
			created_at, updated_at
		FROM appointments
		WHERE patient_id=$1
		ORDER BY scheduled_at DESC
		LIMIT $2
	`
	rows, err := r.db.QueryContext(ctx, qry, patientID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []*model.Appointment
	for rows.Next() {
		var row appointmentRow
		if err := rows.Scan(
			&row.ID, &row.TenantID, &row.PatientID, &row.CreatedBy, &row.ScheduledAt, &row.Status, &row.Reason, &row.Notes,
			&row.Description, &row.Priority, &row.AppointmentType, &row.ServiceType, &row.ServiceCategory,
			&row.FacilityID, &row.FacilityName, &row.FacilityAddress,
			&row.NearbyHospitalID, &row.NearbyHospitalName, &row.NearbyHospitalAddress, &row.NearbyHospitalDistanceKm,
			&row.Location,
			&row.AssignedStaffType, &row.AssignedRoom, &row.AssignedEquipment,
			&row.CreatedAt, &row.UpdatedAt,
		); err != nil {
			return nil, err
		}
		out = append(out, toAppointmentModel(&row))
	}
	return out, rows.Err()
}

func (r *Repository) ListAppointmentsAll(ctx context.Context, limit int) ([]*model.Appointment, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	qry := `
		SELECT id, tenant_id, patient_id, created_by, scheduled_at, status, reason, notes,
			description, priority, appointment_type, service_type, service_category,
			facility_id, facility_name, facility_address,
			nearby_hospital_id, nearby_hospital_name, nearby_hospital_address, nearby_hospital_distance_km,
			location,
			assigned_staff_type, assigned_room, assigned_equipment,
			created_at, updated_at
		FROM appointments
		ORDER BY scheduled_at DESC
		LIMIT $1
	`
	rows, err := r.db.QueryContext(ctx, qry, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []*model.Appointment
	for rows.Next() {
		var row appointmentRow
		if err := rows.Scan(
			&row.ID, &row.TenantID, &row.PatientID, &row.CreatedBy, &row.ScheduledAt, &row.Status, &row.Reason, &row.Notes,
			&row.Description, &row.Priority, &row.AppointmentType, &row.ServiceType, &row.ServiceCategory,
			&row.FacilityID, &row.FacilityName, &row.FacilityAddress,
			&row.NearbyHospitalID, &row.NearbyHospitalName, &row.NearbyHospitalAddress, &row.NearbyHospitalDistanceKm,
			&row.Location,
			&row.AssignedStaffType, &row.AssignedRoom, &row.AssignedEquipment,
			&row.CreatedAt, &row.UpdatedAt,
		); err != nil {
			return nil, err
		}
		out = append(out, toAppointmentModel(&row))
	}
	return out, rows.Err()
}

func (r *Repository) ListAppointmentsForOrganization(ctx context.Context, organizationID string, limit int) ([]*model.Appointment, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	qry := `
		SELECT id, tenant_id, patient_id, created_by, scheduled_at, status, reason, notes,
			description, priority, appointment_type, service_type, service_category,
			facility_id, facility_name, facility_address,
			nearby_hospital_id, nearby_hospital_name, nearby_hospital_address, nearby_hospital_distance_km,
			location,
			assigned_staff_type, assigned_room, assigned_equipment,
			created_at, updated_at
		FROM appointments
		WHERE (facility_id IS NOT NULL AND lower(facility_id::text) = lower($1))
		   OR (nearby_hospital_id IS NOT NULL AND lower(nearby_hospital_id) = lower($1))
		ORDER BY scheduled_at DESC
		LIMIT $2
	`
	rows, err := r.db.QueryContext(ctx, qry, organizationID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []*model.Appointment
	for rows.Next() {
		var row appointmentRow
		if err := rows.Scan(
			&row.ID, &row.TenantID, &row.PatientID, &row.CreatedBy, &row.ScheduledAt, &row.Status, &row.Reason, &row.Notes,
			&row.Description, &row.Priority, &row.AppointmentType, &row.ServiceType, &row.ServiceCategory,
			&row.FacilityID, &row.FacilityName, &row.FacilityAddress,
			&row.NearbyHospitalID, &row.NearbyHospitalName, &row.NearbyHospitalAddress, &row.NearbyHospitalDistanceKm,
			&row.Location,
			&row.AssignedStaffType, &row.AssignedRoom, &row.AssignedEquipment,
			&row.CreatedAt, &row.UpdatedAt,
		); err != nil {
			return nil, err
		}
		out = append(out, toAppointmentModel(&row))
	}
	return out, rows.Err()
}

func (r *Repository) GetAppointmentByID(ctx context.Context, id string) (*model.Appointment, error) {
	qry := `
		SELECT id, tenant_id, patient_id, created_by, scheduled_at, status, reason, notes,
			description, priority, appointment_type, service_type, service_category,
			facility_id, facility_name, facility_address,
			nearby_hospital_id, nearby_hospital_name, nearby_hospital_address, nearby_hospital_distance_km,
			location,
			assigned_staff_type, assigned_room, assigned_equipment,
			created_at, updated_at
		FROM appointments
		WHERE id=$1
	`
	var row appointmentRow
	if err := r.db.QueryRowContext(ctx, qry, id).Scan(
		&row.ID, &row.TenantID, &row.PatientID, &row.CreatedBy, &row.ScheduledAt, &row.Status, &row.Reason, &row.Notes,
		&row.Description, &row.Priority, &row.AppointmentType, &row.ServiceType, &row.ServiceCategory,
		&row.FacilityID, &row.FacilityName, &row.FacilityAddress,
		&row.NearbyHospitalID, &row.NearbyHospitalName, &row.NearbyHospitalAddress, &row.NearbyHospitalDistanceKm,
		&row.Location,
		&row.AssignedStaffType, &row.AssignedRoom, &row.AssignedEquipment,
		&row.CreatedAt, &row.UpdatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return toAppointmentModel(&row), nil
}

func (r *Repository) UpdateAppointment(
	ctx context.Context,
	id string,
	scheduledAt *time.Time,
	status *string,
	reason *string,
	notes *string,
	description *string,
	priority *string,
	appointmentType *string,
	serviceType *string,
	serviceCategory *string,
	facilityID *string,
	facilityName *string,
	facilityAddress *string,
	nearbyHospitalID *string,
	nearbyHospitalName *string,
	nearbyHospitalAddress *string,
	nearbyHospitalDistanceKm *float64,
	location *string,
	assignedStaffType *string,
	assignedRoom *string,
	assignedEquipment *string,
) (*model.Appointment, error) {
	qry := `
		UPDATE appointments
		SET scheduled_at = COALESCE($2, scheduled_at),
		    status = COALESCE($3, status),
		    reason = COALESCE($4, reason),
		    notes = COALESCE($5, notes),
		    description = COALESCE($6, description),
		    priority = COALESCE($7, priority),
		    appointment_type = COALESCE($8, appointment_type),
		    service_type = COALESCE($9, service_type),
		    service_category = COALESCE($10, service_category),
		    facility_id = COALESCE($11, facility_id),
		    facility_name = COALESCE($12, facility_name),
		    facility_address = COALESCE($13, facility_address),
		    nearby_hospital_id = COALESCE($14, nearby_hospital_id),
		    nearby_hospital_name = COALESCE($15, nearby_hospital_name),
		    nearby_hospital_address = COALESCE($16, nearby_hospital_address),
		    nearby_hospital_distance_km = COALESCE($17, nearby_hospital_distance_km),
		    location = COALESCE($18, location),
		    assigned_staff_type = COALESCE($19, assigned_staff_type),
		    assigned_room = COALESCE($20, assigned_room),
		    assigned_equipment = COALESCE($21, assigned_equipment),
		    updated_at = NOW()
		WHERE id=$1
		RETURNING id, tenant_id, patient_id, created_by, scheduled_at, status, reason, notes,
			description, priority, appointment_type, service_type, service_category,
			facility_id, facility_name, facility_address,
			nearby_hospital_id, nearby_hospital_name, nearby_hospital_address, nearby_hospital_distance_km,
			location,
			assigned_staff_type, assigned_room, assigned_equipment,
			created_at, updated_at
	`
	var row appointmentRow
	if err := r.db.QueryRowContext(
		ctx,
		qry,
		id,
		scheduledAt,
		status,
		reason,
		notes,
		description,
		priority,
		appointmentType,
		serviceType,
		serviceCategory,
		facilityID,
		facilityName,
		facilityAddress,
		nearbyHospitalID,
		nearbyHospitalName,
		nearbyHospitalAddress,
		nearbyHospitalDistanceKm,
		location,
		assignedStaffType,
		assignedRoom,
		assignedEquipment,
	).Scan(
		&row.ID, &row.TenantID, &row.PatientID, &row.CreatedBy, &row.ScheduledAt, &row.Status, &row.Reason, &row.Notes,
		&row.Description, &row.Priority, &row.AppointmentType, &row.ServiceType, &row.ServiceCategory,
		&row.FacilityID, &row.FacilityName, &row.FacilityAddress,
		&row.NearbyHospitalID, &row.NearbyHospitalName, &row.NearbyHospitalAddress, &row.NearbyHospitalDistanceKm,
		&row.Location,
		&row.AssignedStaffType, &row.AssignedRoom, &row.AssignedEquipment,
		&row.CreatedAt, &row.UpdatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return toAppointmentModel(&row), nil
}

func (r *Repository) DeleteAppointment(ctx context.Context, id string) error {
	res, err := r.db.ExecContext(ctx, `DELETE FROM appointments WHERE id=$1`, id)
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

func toAppointmentModel(row *appointmentRow) *model.Appointment {
	var tenantID *string
	if row.TenantID.Valid {
		tenantID = &row.TenantID.String
	}
	var createdBy *string
	if row.CreatedBy.Valid {
		createdBy = &row.CreatedBy.String
	}
	var reason *string
	if row.Reason.Valid {
		reason = &row.Reason.String
	}
	var notes *string
	if row.Notes.Valid {
		notes = &row.Notes.String
	}
	var description *string
	if row.Description.Valid {
		description = &row.Description.String
	}
	var priority *string
	if row.Priority.Valid {
		priority = &row.Priority.String
	}
	var appointmentType *string
	if row.AppointmentType.Valid {
		appointmentType = &row.AppointmentType.String
	}
	var serviceType *string
	if row.ServiceType.Valid {
		serviceType = &row.ServiceType.String
	}
	var serviceCategory *string
	if row.ServiceCategory.Valid {
		serviceCategory = &row.ServiceCategory.String
	}
	var facilityID *string
	if row.FacilityID.Valid {
		facilityID = &row.FacilityID.String
	}
	var facilityName *string
	if row.FacilityName.Valid {
		facilityName = &row.FacilityName.String
	}
	var facilityAddress *string
	if row.FacilityAddress.Valid {
		facilityAddress = &row.FacilityAddress.String
	}
	var location *string
	if row.Location.Valid {
		location = &row.Location.String
	}
	var nearbyHospitalID *string
	if row.NearbyHospitalID.Valid {
		nearbyHospitalID = &row.NearbyHospitalID.String
	}
	var nearbyHospitalName *string
	if row.NearbyHospitalName.Valid {
		nearbyHospitalName = &row.NearbyHospitalName.String
	}
	var nearbyHospitalAddress *string
	if row.NearbyHospitalAddress.Valid {
		nearbyHospitalAddress = &row.NearbyHospitalAddress.String
	}
	var nearbyHospitalDistanceKm *float64
	if row.NearbyHospitalDistanceKm.Valid {
		nearbyHospitalDistanceKm = &row.NearbyHospitalDistanceKm.Float64
	}
	var assignedStaffType *string
	if row.AssignedStaffType.Valid {
		assignedStaffType = &row.AssignedStaffType.String
	}
	var assignedRoom *string
	if row.AssignedRoom.Valid {
		assignedRoom = &row.AssignedRoom.String
	}
	var assignedEquipment *string
	if row.AssignedEquipment.Valid {
		assignedEquipment = &row.AssignedEquipment.String
	}
	return &model.Appointment{
		Base:                     model.Base{ID: row.ID, CreatedAt: row.CreatedAt, UpdatedAt: row.UpdatedAt},
		TenantID:                 tenantID,
		PatientID:                row.PatientID,
		CreatedBy:                createdBy,
		ScheduledAt:              row.ScheduledAt,
		Status:                   row.Status,
		Reason:                   reason,
		Notes:                    notes,
		Description:              description,
		Priority:                 priority,
		AppointmentType:          appointmentType,
		ServiceType:              serviceType,
		ServiceCategory:          serviceCategory,
		FacilityID:               facilityID,
		FacilityName:             facilityName,
		FacilityAddress:          facilityAddress,
		NearbyHospitalID:         nearbyHospitalID,
		NearbyHospitalName:       nearbyHospitalName,
		NearbyHospitalAddress:    nearbyHospitalAddress,
		NearbyHospitalDistanceKm: nearbyHospitalDistanceKm,
		Location:                 location,
		AssignedStaffType:        assignedStaffType,
		AssignedRoom:             assignedRoom,
		AssignedEquipment:        assignedEquipment,
	}
}
