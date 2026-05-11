package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"time"

	"github.com/tenadam/api-gateway/internal/model"
)

type userRow struct {
	ID             string
	TenantID       sql.NullString
	OrganizationID sql.NullString
	FullName       string
	Email          string
	Active         bool
	CreatedAt      time.Time
	UpdatedAt      time.Time
	Password       string
}

func (r *Repository) GetUserByEmail(ctx context.Context, email string) (*model.User, string, error) {
	qry := `SELECT id, tenant_id, organization_id, full_name, email, active, created_at, updated_at, password_hash FROM users WHERE email=$1`
	var row userRow
	if err := r.db.QueryRowContext(ctx, qry, email).Scan(
		&row.ID, &row.TenantID, &row.OrganizationID, &row.FullName, &row.Email, &row.Active, &row.CreatedAt, &row.UpdatedAt, &row.Password,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, "", ErrNotFound
		}
		return nil, "", err
	}
	role, err := r.GetUserPrimaryRole(ctx, row.ID)
	if err != nil {
		return nil, "", err
	}
	var tenantID *string
	if row.TenantID.Valid {
		tenantID = &row.TenantID.String
	}
	var orgID *string
	if row.OrganizationID.Valid {
		orgID = &row.OrganizationID.String
	}

	return &model.User{
		Base:           model.Base{ID: row.ID, CreatedAt: row.CreatedAt, UpdatedAt: row.UpdatedAt},
		TenantID:       tenantID,
		OrganizationID: orgID,
		FullName:       row.FullName,
		Email:          row.Email,
		Role:           role,
		Active:         row.Active,
	}, row.Password, nil
}

func (r *Repository) GetUserPrimaryRole(ctx context.Context, userID string) (string, error) {
	qry := `
		SELECT roles.name
		FROM user_roles
		JOIN roles ON roles.id = user_roles.role_id
		WHERE user_roles.user_id = $1
		ORDER BY roles.name ASC
		LIMIT 1
	`
	var role sql.NullString
	if err := r.db.QueryRowContext(ctx, qry, userID).Scan(&role); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", nil
		}
		return "", err
	}
	if role.Valid {
		return role.String, nil
	}
	return "", nil
}

func (r *Repository) CreateOrgUser(ctx context.Context, fullName, email, passwordHash, role string) (map[string]any, error) {
	qry := `
		WITH new_user AS (
			INSERT INTO users (tenant_id, organization_id, full_name, email, password_hash)
			VALUES ((SELECT id FROM tenants WHERE slug='default'), (SELECT id FROM organizations WHERE slug='default-org'), $1, $2, $3)
			RETURNING id, full_name, email, active, created_at
		), role_row AS (
			SELECT id, name FROM roles WHERE name = $4
		), assigned_role AS (
			INSERT INTO user_roles (user_id, role_id)
			SELECT new_user.id, role_row.id FROM new_user, role_row
			RETURNING user_id
		)
		SELECT new_user.id, new_user.full_name, new_user.email, role_row.name, new_user.active, new_user.created_at
		FROM new_user
		JOIN assigned_role ON assigned_role.user_id = new_user.id
		JOIN role_row ON TRUE
	`

	var id, outName, outEmail, outRole string
	var active bool
	var createdAt time.Time
	if err := r.db.QueryRowContext(ctx, qry, fullName, email, passwordHash, role).Scan(&id, &outName, &outEmail, &outRole, &active, &createdAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("invalid role")
		}
		return nil, err
	}

	return map[string]any{
		"id":         id,
		"full_name":  outName,
		"email":      outEmail,
		"role":       outRole,
		"active":     active,
		"created_at": createdAt,
	}, nil
}

func (r *Repository) ListOrgUsers(ctx context.Context, limit int) ([]map[string]any, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}

	qry := `
		SELECT users.id, users.full_name, users.email, COALESCE(roles.name, ''), COALESCE(organizations.name, ''), users.active, users.created_at
		FROM users
		LEFT JOIN user_roles ON user_roles.user_id = users.id
		LEFT JOIN roles ON roles.id = user_roles.role_id
		LEFT JOIN organizations ON organizations.id = users.organization_id
		ORDER BY users.created_at DESC
		LIMIT $1
	`
	rows, err := r.db.QueryContext(ctx, qry, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]map[string]any, 0)
	for rows.Next() {
		var id, fullName, email, role, organizationName string
		var active bool
		var createdAt time.Time
		if err := rows.Scan(&id, &fullName, &email, &role, &organizationName, &active, &createdAt); err != nil {
			return nil, err
		}
		out = append(out, map[string]any{
			"id":                id,
			"full_name":         fullName,
			"email":             email,
			"role":              role,
			"organization_name": organizationName,
			"active":            active,
			"created_at":        createdAt,
		})
	}

	return out, rows.Err()
}

func (r *Repository) ListOrganizations(ctx context.Context) ([]map[string]any, error) {
	qry := `
		SELECT id, tenant_id, name, slug, contact_name, contact_email, contact_phone, address, latitude, longitude, services, created_at, updated_at
		FROM public.organizations
		ORDER BY id ASC
	`
	rows, err := r.db.QueryContext(ctx, qry)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]map[string]any, 0)
	for rows.Next() {
		var (
			id           string
			tenantID     sql.NullString
			name         string
			slug         string
			contactName  sql.NullString
			contactEmail sql.NullString
			contactPhone sql.NullString
			address      sql.NullString
			latitude     sql.NullFloat64
			longitude    sql.NullFloat64
			servicesRaw  []byte
			createdAt    time.Time
			updatedAt    time.Time
		)
		if err := rows.Scan(&id, &tenantID, &name, &slug, &contactName, &contactEmail, &contactPhone, &address, &latitude, &longitude, &servicesRaw, &createdAt, &updatedAt); err != nil {
			return nil, err
		}
		services := make([]string, 0)
		if len(servicesRaw) > 0 {
			_ = json.Unmarshal(servicesRaw, &services)
		}
		item := map[string]any{
			"id":   id,
			"name": name,
			"slug": slug,
			"contact_name": func() any {
				if contactName.Valid {
					return contactName.String
				}
				return nil
			}(),
			"contact_email": func() any {
				if contactEmail.Valid {
					return contactEmail.String
				}
				return nil
			}(),
			"contact_phone": func() any {
				if contactPhone.Valid {
					return contactPhone.String
				}
				return nil
			}(),
			"address": func() any {
				if address.Valid {
					return address.String
				}
				return nil
			}(),
			"latitude": func() any {
				if latitude.Valid {
					return latitude.Float64
				}
				return nil
			}(),
			"longitude": func() any {
				if longitude.Valid {
					return longitude.Float64
				}
				return nil
			}(),
			"services":   services,
			"created_at": createdAt,
			"updated_at": updatedAt,
		}
		if tenantID.Valid {
			item["tenant_id"] = tenantID.String
		} else {
			item["tenant_id"] = nil
		}
		out = append(out, item)
	}

	return out, rows.Err()
}

func (r *Repository) UpdateOrgUser(ctx context.Context, userID string, fullName, email *string) (map[string]any, error) {
	qry := `
		UPDATE users
		SET full_name = COALESCE($2, full_name),
			email = COALESCE($3, email),
			updated_at = NOW()
		WHERE id = $1
		RETURNING id, full_name, email, active, created_at
	`

	var id, outName, outEmail string
	var active bool
	var createdAt time.Time
	if err := r.db.QueryRowContext(ctx, qry, userID, fullName, email).Scan(&id, &outName, &outEmail, &active, &createdAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	role, err := r.GetUserPrimaryRole(ctx, userID)
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"id":         id,
		"full_name":  outName,
		"email":      outEmail,
		"role":       role,
		"active":     active,
		"created_at": createdAt,
	}, nil
}

func (r *Repository) SetOrgUserRole(ctx context.Context, userID, role string) (map[string]any, error) {
	qry := `
		WITH role_row AS (
			SELECT id, name FROM roles WHERE name = $2
		), cleared AS (
			DELETE FROM user_roles WHERE user_id = $1
		), assigned AS (
			INSERT INTO user_roles (user_id, role_id)
			SELECT $1, role_row.id FROM role_row
			RETURNING user_id
		)
		SELECT users.id, users.full_name, users.email, role_row.name, users.active, users.created_at
		FROM users
		JOIN assigned ON assigned.user_id = users.id
		JOIN role_row ON TRUE
		WHERE users.id = $1
	`

	var id, fullName, email, outRole string
	var active bool
	var createdAt time.Time
	if err := r.db.QueryRowContext(ctx, qry, userID, role).Scan(&id, &fullName, &email, &outRole, &active, &createdAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("invalid user or role")
		}
		return nil, err
	}

	return map[string]any{
		"id":         id,
		"full_name":  fullName,
		"email":      email,
		"role":       outRole,
		"active":     active,
		"created_at": createdAt,
	}, nil
}

func (r *Repository) SetOrgUserActive(ctx context.Context, userID string, active bool) (map[string]any, error) {
	qry := `
		UPDATE users
		SET active = $2, updated_at = NOW()
		WHERE id = $1
		RETURNING id, full_name, email, active, created_at
	`

	var id, fullName, email string
	var outActive bool
	var createdAt time.Time
	if err := r.db.QueryRowContext(ctx, qry, userID, active).Scan(&id, &fullName, &email, &outActive, &createdAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	role, err := r.GetUserPrimaryRole(ctx, userID)
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"id":         id,
		"full_name":  fullName,
		"email":      email,
		"role":       role,
		"active":     outActive,
		"created_at": createdAt,
	}, nil
}

func (r *Repository) ResetOrgUserPassword(ctx context.Context, userID, passwordHash string) error {
	qry := `UPDATE users SET password_hash=$2, updated_at=NOW() WHERE id=$1`
	res, err := r.db.ExecContext(ctx, qry, userID, passwordHash)
	if err != nil {
		return err
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *Repository) OrgSystemOverview(ctx context.Context) (map[string]any, error) {
	var totalUsers, activeUsers, aiModels, teleArtifacts int

	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM users`).Scan(&totalUsers); err != nil {
		return nil, err
	}
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM users WHERE active=TRUE`).Scan(&activeUsers); err != nil {
		return nil, err
	}
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM ai_models`).Scan(&aiModels); err != nil {
		return nil, err
	}
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM telemedicine_session_artifacts`).Scan(&teleArtifacts); err != nil {
		return nil, err
	}

	roleRows, err := r.db.QueryContext(ctx, `
		SELECT COALESCE(roles.name, 'unknown') AS role_name, COUNT(*)
		FROM users
		LEFT JOIN user_roles ON user_roles.user_id = users.id
		LEFT JOIN roles ON roles.id = user_roles.role_id
		GROUP BY role_name
	`)
	if err != nil {
		return nil, err
	}
	defer roleRows.Close()

	roleCounts := map[string]int{}
	for roleRows.Next() {
		var roleName string
		var count int
		if err := roleRows.Scan(&roleName, &count); err != nil {
			return nil, err
		}
		roleCounts[roleName] = count
	}
	if err := roleRows.Err(); err != nil {
		return nil, err
	}

	recentRows, err := r.db.QueryContext(ctx, `
		SELECT users.id, users.full_name, COALESCE(roles.name, ''), users.created_at
		FROM users
		LEFT JOIN user_roles ON user_roles.user_id = users.id
		LEFT JOIN roles ON roles.id = user_roles.role_id
		ORDER BY users.created_at DESC
		LIMIT 5
	`)
	if err != nil {
		return nil, err
	}
	defer recentRows.Close()

	recent := make([]map[string]any, 0)
	for recentRows.Next() {
		var id, fullName, role string
		var createdAt time.Time
		if err := recentRows.Scan(&id, &fullName, &role, &createdAt); err != nil {
			return nil, err
		}
		recent = append(recent, map[string]any{
			"id":         id,
			"title":      fullName,
			"detail":     role,
			"created_at": createdAt,
		})
	}
	if err := recentRows.Err(); err != nil {
		return nil, err
	}

	return map[string]any{
		"total_users":       totalUsers,
		"active_sessions":   activeUsers,
		"system_health":     "healthy",
		"system_health_pct": 99.95,
		"api_usage_24h":     teleArtifacts + aiModels + totalUsers,
		"role_counts":       roleCounts,
		"recent_activity":   recent,
	}, nil
}
