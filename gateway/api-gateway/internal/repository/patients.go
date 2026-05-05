package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"time"

	"github.com/tenadam/api-gateway/internal/model"
)

var ErrNotFound = errors.New("not found")

type patientRow struct {
	ID        string
	TenantID  sql.NullString
	FullName  string
	Email     string
	Phone     string
	Profile   []byte
	Active    bool
	CreatedAt time.Time
	UpdatedAt time.Time
	Password  string
}

func (r *Repository) CreatePatient(ctx context.Context, fullName, email, phone, passwordHash string, profile map[string]any) (*model.Patient, error) {
	profileJSON, err := json.Marshal(profile)
	if err != nil {
		return nil, err
	}
	qry := `
		INSERT INTO patients (tenant_id, full_name, email, phone, password_hash, profile)
		VALUES ((SELECT id FROM tenants WHERE slug='default'), $1, $2, $3, $4, $5::jsonb)
		RETURNING id, tenant_id, full_name, email, phone, profile, active, created_at, updated_at
	`
	var row patientRow
	if err := r.db.QueryRowContext(ctx, qry, fullName, email, phone, passwordHash, string(profileJSON)).Scan(
		&row.ID, &row.TenantID, &row.FullName, &row.Email, &row.Phone, &row.Profile, &row.Active, &row.CreatedAt, &row.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return toPatientModel(&row)
}

func (r *Repository) GetPatientByEmail(ctx context.Context, email string) (*model.Patient, string, error) {
	qry := `SELECT id, tenant_id, full_name, email, phone, COALESCE(profile, '{}'::jsonb), active, created_at, updated_at, password_hash FROM patients WHERE email=$1`
	var row patientRow
	if err := r.db.QueryRowContext(ctx, qry, email).Scan(
		&row.ID, &row.TenantID, &row.FullName, &row.Email, &row.Phone, &row.Profile, &row.Active, &row.CreatedAt, &row.UpdatedAt, &row.Password,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, "", ErrNotFound
		}
		return nil, "", err
	}
	p, err := toPatientModel(&row)
	if err != nil {
		return nil, "", err
	}
	return p, row.Password, nil
}

func (r *Repository) GetPatientByID(ctx context.Context, id string) (*model.Patient, error) {
	qry := `SELECT id, tenant_id, full_name, email, phone, COALESCE(profile, '{}'::jsonb), active, created_at, updated_at FROM patients WHERE id=$1`
	var row patientRow
	if err := r.db.QueryRowContext(ctx, qry, id).Scan(
		&row.ID, &row.TenantID, &row.FullName, &row.Email, &row.Phone, &row.Profile, &row.Active, &row.CreatedAt, &row.UpdatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return toPatientModel(&row)
}

func (r *Repository) UpdatePatientProfileMerge(ctx context.Context, id string, fullName, email, phone string, profilePatch map[string]any) (*model.Patient, error) {
	patchJSON, err := json.Marshal(profilePatch)
	if err != nil {
		return nil, err
	}
	qry := `
		UPDATE patients
		SET full_name = COALESCE(NULLIF($2, ''), full_name),
		    email = COALESCE(NULLIF($3, ''), email),
		    phone = COALESCE(NULLIF($4, ''), phone),
		    profile = COALESCE(profile, '{}'::jsonb) || $5::jsonb,
		    updated_at = NOW()
		WHERE id=$1
		RETURNING id, tenant_id, full_name, email, phone, COALESCE(profile, '{}'::jsonb), active, created_at, updated_at
	`
	var row patientRow
	if err := r.db.QueryRowContext(ctx, qry, id, fullName, email, phone, string(patchJSON)).Scan(
		&row.ID, &row.TenantID, &row.FullName, &row.Email, &row.Phone, &row.Profile, &row.Active, &row.CreatedAt, &row.UpdatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return toPatientModel(&row)
}

func (r *Repository) ListPatients(ctx context.Context, limit int) ([]*model.Patient, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	qry := `SELECT id, tenant_id, full_name, email, phone, COALESCE(profile, '{}'::jsonb), active, created_at, updated_at FROM patients ORDER BY created_at DESC LIMIT $1`
	rows, err := r.db.QueryContext(ctx, qry, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []*model.Patient
	for rows.Next() {
		var row patientRow
		if err := rows.Scan(&row.ID, &row.TenantID, &row.FullName, &row.Email, &row.Phone, &row.Profile, &row.Active, &row.CreatedAt, &row.UpdatedAt); err != nil {
			return nil, err
		}
		p, err := toPatientModel(&row)
		if err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, rows.Err()
}

func (r *Repository) ListPatientsByOrganization(ctx context.Context, organizationID string, limit int) ([]*model.Patient, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	qry := `
		SELECT DISTINCT p.id, p.tenant_id, p.full_name, p.email, p.phone, COALESCE(p.profile, '{}'::jsonb), p.active, p.created_at, p.updated_at
		FROM patients p
		JOIN appointments a ON a.patient_id = p.id
		WHERE (a.facility_id IS NOT NULL AND a.facility_id = $1::uuid)
		   OR (a.nearby_hospital_id IS NOT NULL AND lower(a.nearby_hospital_id) = lower($1::text))
		ORDER BY p.created_at DESC
		LIMIT $2
	`
	rows, err := r.db.QueryContext(ctx, qry, organizationID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []*model.Patient
	for rows.Next() {
		var row patientRow
		if err := rows.Scan(&row.ID, &row.TenantID, &row.FullName, &row.Email, &row.Phone, &row.Profile, &row.Active, &row.CreatedAt, &row.UpdatedAt); err != nil {
			return nil, err
		}
		p, err := toPatientModel(&row)
		if err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, rows.Err()
}

func (r *Repository) GetPatientByIDForOrganization(ctx context.Context, patientID, organizationID string) (*model.Patient, error) {
	qry := `
		SELECT p.id, p.tenant_id, p.full_name, p.email, p.phone, COALESCE(p.profile, '{}'::jsonb), p.active, p.created_at, p.updated_at
		FROM patients p
		WHERE p.id = $1
		  AND EXISTS (
			SELECT 1
			FROM appointments a
			WHERE a.patient_id = p.id
			  AND (
				(a.facility_id IS NOT NULL AND a.facility_id = $2::uuid)
				OR (a.nearby_hospital_id IS NOT NULL AND lower(a.nearby_hospital_id) = lower($2::text))
			  )
		  )
	`

	var row patientRow
	if err := r.db.QueryRowContext(ctx, qry, patientID, organizationID).Scan(
		&row.ID, &row.TenantID, &row.FullName, &row.Email, &row.Phone, &row.Profile, &row.Active, &row.CreatedAt, &row.UpdatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return toPatientModel(&row)
}

func toPatientModel(row *patientRow) (*model.Patient, error) {
	var profile map[string]any
	if len(row.Profile) > 0 {
		if err := json.Unmarshal(row.Profile, &profile); err != nil {
			return nil, err
		}
	}
	var tenantID *string
	if row.TenantID.Valid {
		tenantID = &row.TenantID.String
	}
	return &model.Patient{
		Base:     model.Base{ID: row.ID, CreatedAt: row.CreatedAt, UpdatedAt: row.UpdatedAt},
		TenantID: tenantID,
		FullName: row.FullName,
		Email:    row.Email,
		Phone:    row.Phone,
		Profile:  profile,
		Active:   row.Active,
	}, nil
}
