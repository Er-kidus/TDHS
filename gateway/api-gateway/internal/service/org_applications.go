package service

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type OrgApplicationStatus string

const (
	OrgApplicationPending  OrgApplicationStatus = "pending"
	OrgApplicationApproved OrgApplicationStatus = "approved"
	OrgApplicationVerified OrgApplicationStatus = "verified"
)

type OrgApplicationLocation struct {
	Address   string  `json:"address"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type OrgApplication struct {
	ID                      string                 `json:"id"`
	OrganizationName        string                 `json:"organization_name"`
	OrganizationSlug        string                 `json:"organization_slug"`
	OrganizationDomain      string                 `json:"organization_domain,omitempty"`
	ContactName             string                 `json:"contact_name"`
	ContactEmail            string                 `json:"contact_email"`
	ContactPhone            string                 `json:"contact_phone"`
	LicenseNumber           string                 `json:"license_number"`
	Location                OrgApplicationLocation `json:"location"`
	RequestedServices       []string               `json:"requested_services"`
	ConfiguredServices      []string               `json:"configured_services"`
	SelectedStaffTemplates  []string               `json:"selected_staff_templates"`
	UpdateRequestedServices []string               `json:"update_requested_services"`
	UpdateRequestNotes      string                 `json:"update_request_notes,omitempty"`
	UpdateRequestStatus     string                 `json:"update_request_status,omitempty"`
	LastUpdateRequestAt     *time.Time             `json:"last_update_request_at,omitempty"`
	DomainConfiguredAt      *time.Time             `json:"domain_configured_at,omitempty"`
	Status                  OrgApplicationStatus   `json:"status"`
	ApprovedBy              string                 `json:"approved_by,omitempty"`
	VerifiedAt              *time.Time             `json:"verified_at,omitempty"`
	CreatedAt               time.Time              `json:"created_at"`
	UpdatedAt               time.Time              `json:"updated_at"`
}

type RegisteredHospital struct {
	OrganizationID     string   `json:"organization_id"`
	OrganizationName   string   `json:"organization_name"`
	OrganizationSlug   string   `json:"organization_slug"`
	OrganizationDomain string   `json:"organization_domain,omitempty"`
	Address            string   `json:"address"`
	Latitude           *float64 `json:"latitude,omitempty"`
	Longitude          *float64 `json:"longitude,omitempty"`
}

type OrgStaffRoleTemplate struct {
	TemplateKey string    `json:"template_key"`
	Title       string    `json:"title"`
	RoleGroup   string    `json:"role_group"`
	Category    string    `json:"category"`
	ApiRole     string    `json:"api_role"`
	Description string    `json:"description"`
	SortOrder   int       `json:"sort_order"`
	Active      bool      `json:"active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type OrgSystemRole struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Active      bool   `json:"active"`
}

type SubmitOrgApplicationInput struct {
	OrganizationName  string
	OrganizationSlug  string
	ContactName       string
	ContactEmail      string
	ContactPhone      string
	LicenseNumber     string
	Location          OrgApplicationLocation
	RequestedServices []string
	StaffTemplates    []string
}

type OrgApplicationService struct {
	db *sql.DB
}

func NewOrgApplicationService(db *sql.DB) *OrgApplicationService {
	service := &OrgApplicationService{db: db}
	if db != nil {
		_ = service.seedStaffRoleTemplates()
	}
	return service
}

func (s *OrgApplicationService) Submit(input SubmitOrgApplicationInput) (*OrgApplication, error) {
	if s.db == nil {
		return nil, errors.New("organization applications are unavailable")
	}

	input.OrganizationName = strings.TrimSpace(input.OrganizationName)
	input.OrganizationSlug = strings.TrimSpace(input.OrganizationSlug)
	input.ContactName = strings.TrimSpace(input.ContactName)
	input.ContactEmail = strings.TrimSpace(strings.ToLower(input.ContactEmail))
	input.ContactPhone = strings.TrimSpace(input.ContactPhone)
	input.LicenseNumber = strings.TrimSpace(input.LicenseNumber)
	input.Location.Address = strings.TrimSpace(input.Location.Address)

	if input.OrganizationName == "" || input.ContactName == "" || input.ContactEmail == "" || input.ContactPhone == "" || input.LicenseNumber == "" || input.Location.Address == "" {
		return nil, errors.New("organization_name, contact_name, contact_email, contact_phone, license_number, and location.address are required")
	}
	if input.OrganizationSlug == "" {
		input.OrganizationSlug = slugify(input.OrganizationName)
	}
	if input.OrganizationSlug == "" {
		input.OrganizationSlug = "organization"
	}
	uniqueSlug, err := s.ensureUniqueSlug(input.OrganizationSlug)
	if err != nil {
		return nil, err
	}
	input.OrganizationSlug = uniqueSlug

	now := time.Now().UTC()
	application := &OrgApplication{
		ID:                      newApplicationID(),
		OrganizationName:        input.OrganizationName,
		OrganizationSlug:        input.OrganizationSlug,
		OrganizationDomain:      "",
		ContactName:             input.ContactName,
		ContactEmail:            input.ContactEmail,
		ContactPhone:            input.ContactPhone,
		LicenseNumber:           input.LicenseNumber,
		Location:                input.Location,
		RequestedServices:       uniqueStrings(input.RequestedServices),
		ConfiguredServices:      []string{},
		SelectedStaffTemplates:  uniqueStrings(input.StaffTemplates),
		UpdateRequestedServices: []string{},
		UpdateRequestNotes:      "",
		UpdateRequestStatus:     "none",
		Status:                  OrgApplicationPending,
		CreatedAt:               now,
		UpdatedAt:               now,
	}

	_, err = s.db.Exec(
		`INSERT INTO org_applications (
			id,
			organization_name,
			organization_slug,
			organization_domain,
			contact_name,
			contact_email,
			contact_phone,
			license_number,
			location_address,
			location_latitude,
			location_longitude,
			requested_services,
			configured_services,
			selected_staff_templates,
			update_requested_services,
			update_request_notes,
			update_request_status,
			status,
			created_at,
			updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13::jsonb, $14::jsonb, $15::jsonb, $16, $17, $18, $19, $20)`,
		application.ID,
		application.OrganizationName,
		application.OrganizationSlug,
		application.OrganizationDomain,
		application.ContactName,
		application.ContactEmail,
		application.ContactPhone,
		application.LicenseNumber,
		application.Location.Address,
		application.Location.Latitude,
		application.Location.Longitude,
		mustJSON(application.RequestedServices),
		mustJSON(application.ConfiguredServices),
		mustJSON(application.SelectedStaffTemplates),
		mustJSON(application.UpdateRequestedServices),
		application.UpdateRequestNotes,
		application.UpdateRequestStatus,
		application.Status,
		application.CreatedAt,
		application.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return application, nil
}

func (s *OrgApplicationService) List() ([]*OrgApplication, error) {
	if s.db == nil {
		return nil, errors.New("organization applications are unavailable")
	}

	rows, err := s.db.Query(`
		SELECT
			id,
			organization_name,
			organization_slug,
			organization_domain,
			contact_name,
			contact_email,
			contact_phone,
			license_number,
			location_address,
			location_latitude,
			location_longitude,
			requested_services,
			configured_services,
			selected_staff_templates,
			update_requested_services,
			update_request_notes,
			update_request_status,
			last_update_request_at,
			domain_configured_at,
			status,
			approved_by,
			verified_at,
			created_at,
			updated_at
		FROM org_applications
		ORDER BY created_at DESC, id DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]*OrgApplication, 0)
	for rows.Next() {
		application, err := scanOrgApplication(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, application)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return out, nil
}

func (s *OrgApplicationService) ListRegisteredHospitals() ([]*RegisteredHospital, error) {
	if s.db == nil {
		return nil, errors.New("organization applications are unavailable")
	}

	rows, err := s.db.Query(`
		SELECT
			org.id,
			org.name,
			org.slug,
			app.organization_domain,
			app.location_address,
			NULLIF(app.location_latitude, 0),
			NULLIF(app.location_longitude, 0)
		FROM org_applications app
		JOIN organizations org ON lower(org.slug) = lower(app.organization_slug)
		WHERE app.status IN ('approved', 'verified')
		ORDER BY org.name ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]*RegisteredHospital, 0)
	for rows.Next() {
		var (
			item      RegisteredHospital
			domain    sql.NullString
			latitude  sql.NullFloat64
			longitude sql.NullFloat64
		)
		if err := rows.Scan(
			&item.OrganizationID,
			&item.OrganizationName,
			&item.OrganizationSlug,
			&domain,
			&item.Address,
			&latitude,
			&longitude,
		); err != nil {
			return nil, err
		}
		if domain.Valid {
			item.OrganizationDomain = domain.String
		}
		if latitude.Valid {
			item.Latitude = &latitude.Float64
		}
		if longitude.Valid {
			item.Longitude = &longitude.Float64
		}
		out = append(out, &item)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return out, nil
}

func (s *OrgApplicationService) Get(id string) (*OrgApplication, error) {
	if s.db == nil {
		return nil, errors.New("organization applications are unavailable")
	}

	row := s.db.QueryRow(`
		SELECT
			id,
			organization_name,
			organization_slug,
			organization_domain,
			contact_name,
			contact_email,
			contact_phone,
			license_number,
			location_address,
			location_latitude,
			location_longitude,
			requested_services,
			configured_services,
			selected_staff_templates,
			update_requested_services,
			update_request_notes,
			update_request_status,
			last_update_request_at,
			domain_configured_at,
			status,
			approved_by,
			verified_at,
			created_at,
			updated_at
		FROM org_applications
		WHERE id = $1`, strings.TrimSpace(id))
	application, err := scanOrgApplication(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("application not found")
		}
		return nil, err
	}
	return application, nil
}

func (s *OrgApplicationService) Approve(id, approvedBy string) (*OrgApplication, error) {
	if s.db == nil {
		return nil, errors.New("organization applications are unavailable")
	}

	current, err := s.Get(id)
	if err != nil {
		return nil, err
	}
	if err := s.provisionOrganizationAdmin(current); err != nil {
		return nil, err
	}

	row := s.db.QueryRow(`
		UPDATE org_applications
		SET status = $2, approved_by = $3, organization_domain = COALESCE(NULLIF(organization_domain, ''), organization_slug || '.org.tenadam.local'), updated_at = $4
		WHERE id = $1
		RETURNING
			id,
			organization_name,
			organization_slug,
			organization_domain,
			contact_name,
			contact_email,
			contact_phone,
			license_number,
			location_address,
			location_latitude,
			location_longitude,
			requested_services,
			configured_services,
			selected_staff_templates,
			update_requested_services,
			update_request_notes,
			update_request_status,
			last_update_request_at,
			domain_configured_at,
			status,
			approved_by,
			verified_at,
			created_at,
			updated_at`,
		strings.TrimSpace(id),
		OrgApplicationApproved,
		strings.TrimSpace(approvedBy),
		time.Now().UTC(),
	)
	application, err := scanOrgApplication(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("application not found")
		}
		return nil, err
	}
	if err := s.syncOrganizationProfile(application); err != nil {
		return nil, err
	}
	return application, nil
}

func (s *OrgApplicationService) Reject(id, rejectedBy string) (*OrgApplication, error) {
	if s.db == nil {
		return nil, errors.New("organization applications are unavailable")
	}

	row := s.db.QueryRow(`
		UPDATE org_applications
		SET
			status = $2,
			approved_by = $3,
			verified_at = NULL,
			update_request_status = 'rejected',
			updated_at = $4
		WHERE id = $1
		RETURNING
			id,
			organization_name,
			organization_slug,
			organization_domain,
			contact_name,
			contact_email,
			contact_phone,
			license_number,
			location_address,
			location_latitude,
			location_longitude,
			requested_services,
			configured_services,
			selected_staff_templates,
			update_requested_services,
			update_request_notes,
			update_request_status,
			last_update_request_at,
			domain_configured_at,
			status,
			approved_by,
			verified_at,
			created_at,
			updated_at`,
		strings.TrimSpace(id),
		OrgApplicationPending,
		strings.TrimSpace(rejectedBy),
		time.Now().UTC(),
	)

	application, err := scanOrgApplication(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("application not found")
		}
		return nil, err
	}

	return application, nil
}

func DefaultOrgPortalAdminCredentials(slug string) (string, string) {
	normalized := slugify(strings.TrimSpace(slug))
	if normalized == "" {
		normalized = "organization"
	}
	email := fmt.Sprintf("admin@%s.tenadam.local", normalized)
	password := fmt.Sprintf("Admin@%s123", normalized)
	return email, password
}

func (s *OrgApplicationService) provisionOrganizationAdmin(application *OrgApplication) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	if application == nil {
		return errors.New("application is required for provisioning")
	}

	orgName := strings.TrimSpace(application.OrganizationName)
	orgSlug := slugify(strings.TrimSpace(application.OrganizationSlug))
	if orgName == "" || orgSlug == "" {
		return errors.New("invalid organization metadata for provisioning")
	}

	locationAddress := strings.TrimSpace(application.Location.Address)
	contactName := strings.TrimSpace(application.ContactName)
	contactEmail := strings.TrimSpace(application.ContactEmail)
	contactPhone := strings.TrimSpace(application.ContactPhone)
	services := application.ConfiguredServices
	if len(services) == 0 {
		services = application.RequestedServices
	}

	var orgID string
	err = tx.QueryRow(`
		INSERT INTO organizations (tenant_id, name, slug, contact_name, contact_email, contact_phone, address, latitude, longitude, services)
		VALUES ((SELECT id FROM tenants WHERE slug='default'), $1, $2, $3, $4, $5, $6, NULLIF($7, 0), NULLIF($8, 0), $9::jsonb)
		ON CONFLICT (slug)
		DO UPDATE SET
			name = EXCLUDED.name,
			contact_name = EXCLUDED.contact_name,
			contact_email = EXCLUDED.contact_email,
			contact_phone = EXCLUDED.contact_phone,
			address = EXCLUDED.address,
			latitude = EXCLUDED.latitude,
			longitude = EXCLUDED.longitude,
			services = EXCLUDED.services,
			updated_at = NOW()
		RETURNING id
	`, orgName, orgSlug, contactName, contactEmail, contactPhone, locationAddress, application.Location.Latitude, application.Location.Longitude, mustJSON(services)).Scan(&orgID)
	if err != nil {
		return err
	}

	adminEmail, adminPassword := DefaultOrgPortalAdminCredentials(orgSlug)
	hashBytes, hashErr := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)
	if hashErr != nil {
		return hashErr
	}

	var userID string
	err = tx.QueryRow(`
		INSERT INTO users (tenant_id, organization_id, full_name, email, password_hash, active)
		VALUES ((SELECT id FROM tenants WHERE slug='default'), $1, $2, $3, $4, true)
		ON CONFLICT (email)
		DO UPDATE SET
			tenant_id = (SELECT id FROM tenants WHERE slug='default'),
			organization_id = EXCLUDED.organization_id,
			full_name = EXCLUDED.full_name,
			password_hash = EXCLUDED.password_hash,
			active = true,
			updated_at = NOW()
		RETURNING id
	`, orgID, fmt.Sprintf("%s Admin", orgName), adminEmail, string(hashBytes)).Scan(&userID)
	if err != nil {
		return err
	}

	_, err = tx.Exec(`
		INSERT INTO user_roles (user_id, role_id)
		SELECT $1, id FROM roles WHERE name = 'admin'
		ON CONFLICT DO NOTHING
	`, userID)
	if err != nil {
		return err
	}

	err = tx.Commit()
	if err != nil {
		return err
	}
	return nil
}

func (s *OrgApplicationService) ConfigureServices(id string, services []string) (*OrgApplication, error) {
	if s.db == nil {
		return nil, errors.New("organization applications are unavailable")
	}

	cleaned := uniqueStrings(services)
	if len(cleaned) == 0 {
		current, err := s.Get(id)
		if err != nil {
			return nil, err
		}
		cleaned = append([]string{}, current.RequestedServices...)
	}
	verifiedAt := time.Now().UTC()
	row := s.db.QueryRow(`
		UPDATE org_applications
		SET configured_services = $2::jsonb, status = $3, verified_at = $4, update_request_status = 'approved', update_requested_services = '[]'::jsonb, update_request_notes = '', updated_at = $5
		WHERE id = $1
		RETURNING
			id,
			organization_name,
			organization_slug,
			organization_domain,
			contact_name,
			contact_email,
			contact_phone,
			license_number,
			location_address,
			location_latitude,
			location_longitude,
			requested_services,
			configured_services,
			selected_staff_templates,
			update_requested_services,
			update_request_notes,
			update_request_status,
			last_update_request_at,
			domain_configured_at,
			status,
			approved_by,
			verified_at,
			created_at,
			updated_at`,
		strings.TrimSpace(id),
		mustJSON(cleaned),
		OrgApplicationVerified,
		verifiedAt,
		time.Now().UTC(),
	)
	application, err := scanOrgApplication(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("application not found")
		}
		return nil, err
	}
	if err := s.syncOrganizationProfile(application); err != nil {
		return nil, err
	}
	return application, nil
}

func (s *OrgApplicationService) SetStaffTemplates(id string, templates []string) (*OrgApplication, error) {
	if s.db == nil {
		return nil, errors.New("organization applications are unavailable")
	}

	cleaned := uniqueStrings(templates)
	row := s.db.QueryRow(`
		UPDATE org_applications
		SET selected_staff_templates = $2::jsonb, updated_at = $3
		WHERE id = $1
		RETURNING
			id,
			organization_name,
			organization_slug,
			organization_domain,
			contact_name,
			contact_email,
			contact_phone,
			license_number,
			location_address,
			location_latitude,
			location_longitude,
			requested_services,
			configured_services,
			selected_staff_templates,
			update_requested_services,
			update_request_notes,
			update_request_status,
			last_update_request_at,
			domain_configured_at,
			status,
			approved_by,
			verified_at,
			created_at,
			updated_at`,
		strings.TrimSpace(id),
		mustJSON(cleaned),
		time.Now().UTC(),
	)
	application, err := scanOrgApplication(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("application not found")
		}
		return nil, err
	}
	return application, nil
}

func (s *OrgApplicationService) RequestServiceUpdate(id string, services []string, notes string) (*OrgApplication, error) {
	if s.db == nil {
		return nil, errors.New("organization applications are unavailable")
	}

	cleaned := uniqueStrings(services)
	if len(cleaned) == 0 {
		return nil, errors.New("at least one service is required")
	}

	row := s.db.QueryRow(`
		UPDATE org_applications
		SET update_requested_services = $2::jsonb,
			update_request_notes = $3,
			update_request_status = 'pending',
			last_update_request_at = $4,
			updated_at = $4
		WHERE id = $1
		RETURNING
			id,
			organization_name,
			organization_slug,
			organization_domain,
			contact_name,
			contact_email,
			contact_phone,
			license_number,
			location_address,
			location_latitude,
			location_longitude,
			requested_services,
			configured_services,
			selected_staff_templates,
			update_requested_services,
			update_request_notes,
			update_request_status,
			last_update_request_at,
			domain_configured_at,
			status,
			approved_by,
			verified_at,
			created_at,
			updated_at`,
		strings.TrimSpace(id),
		mustJSON(cleaned),
		strings.TrimSpace(notes),
		time.Now().UTC(),
	)
	application, err := scanOrgApplication(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("application not found")
		}
		return nil, err
	}
	return application, nil
}

func (s *OrgApplicationService) ResolveServiceUpdate(id string, approved bool, services []string) (*OrgApplication, error) {
	if s.db == nil {
		return nil, errors.New("organization applications are unavailable")
	}

	if approved {
		cleaned := uniqueStrings(services)
		if len(cleaned) == 0 {
			current, err := s.Get(strings.TrimSpace(id))
			if err != nil {
				return nil, err
			}
			if len(current.UpdateRequestedServices) > 0 {
				cleaned = append([]string{}, current.UpdateRequestedServices...)
			} else {
				cleaned = append([]string{}, current.ConfiguredServices...)
			}
		}
		return s.ConfigureServices(id, cleaned)
	}

	row := s.db.QueryRow(`
		UPDATE org_applications
		SET update_request_status = 'rejected',
			update_requested_services = '[]'::jsonb,
			update_request_notes = '',
			updated_at = $2
		WHERE id = $1
		RETURNING
			id,
			organization_name,
			organization_slug,
			organization_domain,
			contact_name,
			contact_email,
			contact_phone,
			license_number,
			location_address,
			location_latitude,
			location_longitude,
			requested_services,
			configured_services,
			selected_staff_templates,
			update_requested_services,
			update_request_notes,
			update_request_status,
			last_update_request_at,
			domain_configured_at,
			status,
			approved_by,
			verified_at,
			created_at,
			updated_at`,
		strings.TrimSpace(id),
		time.Now().UTC(),
	)
	application, err := scanOrgApplication(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("application not found")
		}
		return nil, err
	}
	return application, nil
}

func (s *OrgApplicationService) SetOrganizationDomain(id, domain string) (*OrgApplication, error) {
	if s.db == nil {
		return nil, errors.New("organization applications are unavailable")
	}

	domain = strings.TrimSpace(strings.ToLower(domain))
	if domain == "" {
		return nil, errors.New("organization domain is required")
	}

	row := s.db.QueryRow(`
		UPDATE org_applications
		SET organization_domain = $2,
			domain_configured_at = $3,
			updated_at = $3
		WHERE id = $1
		RETURNING
			id,
			organization_name,
			organization_slug,
			organization_domain,
			contact_name,
			contact_email,
			contact_phone,
			license_number,
			location_address,
			location_latitude,
			location_longitude,
			requested_services,
			configured_services,
			selected_staff_templates,
			update_requested_services,
			update_request_notes,
			update_request_status,
			last_update_request_at,
			domain_configured_at,
			status,
			approved_by,
			verified_at,
			created_at,
			updated_at`,
		strings.TrimSpace(id),
		domain,
		time.Now().UTC(),
	)
	application, err := scanOrgApplication(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("application not found")
		}
		return nil, err
	}
	if err := s.syncOrganizationProfile(application); err != nil {
		return nil, err
	}
	return application, nil
}

func (s *OrgApplicationService) syncOrganizationProfile(application *OrgApplication) error {
	if s.db == nil || application == nil {
		return nil
	}

	services := application.ConfiguredServices
	if len(services) == 0 {
		services = application.RequestedServices
	}

	_, err := s.db.Exec(`
		UPDATE organizations
		SET
			name = COALESCE(NULLIF($2, ''), name),
			contact_name = COALESCE(NULLIF($3, ''), contact_name),
			contact_email = COALESCE(NULLIF($4, ''), contact_email),
			contact_phone = COALESCE(NULLIF($5, ''), contact_phone),
			address = COALESCE(NULLIF($6, ''), address),
			latitude = COALESCE(NULLIF($7, 0), latitude),
			longitude = COALESCE(NULLIF($8, 0), longitude),
			services = COALESCE($9::jsonb, services, '[]'::jsonb),
			updated_at = NOW()
		WHERE lower(slug) = lower($1)
	`, strings.TrimSpace(application.OrganizationSlug), strings.TrimSpace(application.OrganizationName), strings.TrimSpace(application.ContactName), strings.TrimSpace(application.ContactEmail), strings.TrimSpace(application.ContactPhone), strings.TrimSpace(application.Location.Address), application.Location.Latitude, application.Location.Longitude, mustJSON(services))
	if err != nil {
		return err
	}

	_, err = s.db.Exec(`
		CREATE TABLE IF NOT EXISTS service_management_configurations (
			organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
			tier VARCHAR(64) NOT NULL,
			installed_services JSONB NOT NULL DEFAULT '[]'::jsonb,
			updated_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
	`)
	if err != nil {
		return err
	}

	_, err = s.db.Exec(`
		INSERT INTO service_management_configurations (
			organization_id,
			tier,
			installed_services,
			updated_by
		)
		SELECT
			o.id,
			COALESCE(NULLIF(sm.tier, ''), 'health-center') AS tier,
			$2::jsonb,
			NULL
		FROM organizations o
		LEFT JOIN service_management_configurations sm ON sm.organization_id = o.id
		WHERE lower(o.slug) = lower($1)
		ON CONFLICT (organization_id)
		DO UPDATE SET
			installed_services = EXCLUDED.installed_services,
			updated_at = NOW()
	`, strings.TrimSpace(application.OrganizationSlug), mustJSON(services))

	return err
}

func (s *OrgApplicationService) GetByContactEmail(contactEmail string) (*OrgApplication, error) {
	if s.db == nil {
		return nil, errors.New("organization applications are unavailable")
	}

	row := s.db.QueryRow(`
		SELECT
			id,
			organization_name,
			organization_slug,
			organization_domain,
			contact_name,
			contact_email,
			contact_phone,
			license_number,
			location_address,
			location_latitude,
			location_longitude,
			requested_services,
			configured_services,
			selected_staff_templates,
			update_requested_services,
			update_request_notes,
			update_request_status,
			last_update_request_at,
			domain_configured_at,
			status,
			approved_by,
			verified_at,
			created_at,
			updated_at
		FROM org_applications
		WHERE lower(contact_email) = lower($1)
		ORDER BY
			CASE status
				WHEN 'verified' THEN 3
				WHEN 'approved' THEN 2
				ELSE 1
			END DESC,
			updated_at DESC,
			created_at DESC
		LIMIT 1`, strings.TrimSpace(strings.ToLower(contactEmail)))
	application, err := scanOrgApplication(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("application not found")
		}
		return nil, err
	}
	return application, nil
}

func (s *OrgApplicationService) GetByOrganizationID(orgID string) (*OrgApplication, error) {
	if s.db == nil {
		return nil, errors.New("organization applications are unavailable")
	}

	row := s.db.QueryRow(`
		SELECT
			app.id,
			app.organization_name,
			app.organization_slug,
			app.organization_domain,
			app.contact_name,
			app.contact_email,
			app.contact_phone,
			app.license_number,
			app.location_address,
			app.location_latitude,
			app.location_longitude,
			app.requested_services,
			app.configured_services,
			app.selected_staff_templates,
			app.update_requested_services,
			app.update_request_notes,
			app.update_request_status,
			app.last_update_request_at,
			app.domain_configured_at,
			app.status,
			app.approved_by,
			app.verified_at,
			app.created_at,
			app.updated_at
		FROM org_applications app
		JOIN organizations org ON lower(org.slug) = lower(app.organization_slug)
		WHERE org.id = $1
		ORDER BY
			CASE app.status
				WHEN 'verified' THEN 3
				WHEN 'approved' THEN 2
				ELSE 1
			END DESC,
			app.updated_at DESC,
			app.created_at DESC
		LIMIT 1
	`, strings.TrimSpace(orgID))
	application, err := scanOrgApplication(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("application not found")
		}
		return nil, err
	}
	return application, nil
}

func (s *OrgApplicationService) GetOrganizationIDByContactEmail(contactEmail string) (string, error) {
	if s.db == nil {
		return "", errors.New("organization applications are unavailable")
	}

	var organizationID string
	err := s.db.QueryRow(`
		SELECT org.id
		FROM org_applications app
		JOIN organizations org ON lower(org.slug) = lower(app.organization_slug)
		WHERE lower(app.contact_email) = lower($1)
		ORDER BY
			CASE app.status
				WHEN 'verified' THEN 3
				WHEN 'approved' THEN 2
				ELSE 1
			END DESC,
			app.updated_at DESC,
			app.created_at DESC
		LIMIT 1
	`, strings.TrimSpace(strings.ToLower(contactEmail))).Scan(&organizationID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", errors.New("organization not found")
		}
		return "", err
	}

	return organizationID, nil
}

func (s *OrgApplicationService) Counts() (pending, approved, verified int, err error) {
	if s.db == nil {
		return 0, 0, 0, errors.New("organization applications are unavailable")
	}

	rows, err := s.db.Query(`SELECT status, COUNT(*) FROM org_applications GROUP BY status`)
	if err != nil {
		return 0, 0, 0, err
	}
	defer rows.Close()

	for rows.Next() {
		var status string
		var count int
		if err := rows.Scan(&status, &count); err != nil {
			return 0, 0, 0, err
		}
		switch OrgApplicationStatus(status) {
		case OrgApplicationVerified:
			verified = count
		case OrgApplicationApproved:
			approved = count
		default:
			pending += count
		}
	}
	if err := rows.Err(); err != nil {
		return 0, 0, 0, err
	}
	return pending, approved, verified, nil
}

func (s *OrgApplicationService) ListStaffRoleTemplates() ([]*OrgStaffRoleTemplate, error) {
	if s.db == nil {
		return nil, errors.New("staff role templates are unavailable")
	}

	rows, err := s.db.Query(`
		SELECT template_key, title, role_group, category, api_role, description, sort_order, active, created_at, updated_at
		FROM staff_role_templates
		ORDER BY sort_order ASC, title ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	templates := make([]*OrgStaffRoleTemplate, 0)
	for rows.Next() {
		var template OrgStaffRoleTemplate
		if err := rows.Scan(
			&template.TemplateKey,
			&template.Title,
			&template.RoleGroup,
			&template.Category,
			&template.ApiRole,
			&template.Description,
			&template.SortOrder,
			&template.Active,
			&template.CreatedAt,
			&template.UpdatedAt,
		); err != nil {
			return nil, err
		}
		templates = append(templates, &template)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return templates, nil
}

func (s *OrgApplicationService) ListSystemRoles() ([]*OrgSystemRole, error) {
	if s.db == nil {
		return nil, errors.New("system roles are unavailable")
	}

	rows, err := s.db.Query(`
		SELECT name, COALESCE(description, ''), COALESCE(active, TRUE)
		FROM roles
		ORDER BY name ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	roles := make([]*OrgSystemRole, 0)
	for rows.Next() {
		var item OrgSystemRole
		if err := rows.Scan(&item.Name, &item.Description, &item.Active); err != nil {
			return nil, err
		}
		roles = append(roles, &item)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return roles, nil
}

func (s *OrgApplicationService) CreateStaffRoleTemplate(input OrgStaffRoleTemplate) (*OrgStaffRoleTemplate, error) {
	if s.db == nil {
		return nil, errors.New("staff role templates are unavailable")
	}

	input.TemplateKey = strings.TrimSpace(strings.ToLower(input.TemplateKey))
	input.Title = strings.TrimSpace(input.Title)
	input.RoleGroup = strings.TrimSpace(input.RoleGroup)
	input.Category = strings.TrimSpace(input.Category)
	input.ApiRole = strings.TrimSpace(strings.ToLower(input.ApiRole))
	input.Description = strings.TrimSpace(input.Description)
	if input.SortOrder <= 0 {
		input.SortOrder = 100
	}
	if input.TemplateKey == "" || input.Title == "" || input.RoleGroup == "" || input.Category == "" || input.ApiRole == "" {
		return nil, errors.New("template_key, title, role_group, category, and api_role are required")
	}

	row := s.db.QueryRow(`
		INSERT INTO staff_role_templates (
			template_key,
			title,
			role_group,
			category,
			api_role,
			description,
			sort_order,
			active,
			created_at,
			updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
		RETURNING template_key, title, role_group, category, api_role, description, sort_order, active, created_at, updated_at
	`, input.TemplateKey, input.Title, input.RoleGroup, input.Category, input.ApiRole, input.Description, input.SortOrder, input.Active)

	var item OrgStaffRoleTemplate
	if err := row.Scan(
		&item.TemplateKey,
		&item.Title,
		&item.RoleGroup,
		&item.Category,
		&item.ApiRole,
		&item.Description,
		&item.SortOrder,
		&item.Active,
		&item.CreatedAt,
		&item.UpdatedAt,
	); err != nil {
		return nil, err
	}

	return &item, nil
}

func (s *OrgApplicationService) UpdateStaffRoleTemplate(templateKey string, input OrgStaffRoleTemplate) (*OrgStaffRoleTemplate, error) {
	if s.db == nil {
		return nil, errors.New("staff role templates are unavailable")
	}

	templateKey = strings.TrimSpace(strings.ToLower(templateKey))
	if templateKey == "" {
		return nil, errors.New("template key is required")
	}

	input.Title = strings.TrimSpace(input.Title)
	input.RoleGroup = strings.TrimSpace(input.RoleGroup)
	input.Category = strings.TrimSpace(input.Category)
	input.ApiRole = strings.TrimSpace(strings.ToLower(input.ApiRole))
	input.Description = strings.TrimSpace(input.Description)
	if input.SortOrder <= 0 {
		input.SortOrder = 100
	}

	row := s.db.QueryRow(`
		UPDATE staff_role_templates
		SET
			title = $2,
			role_group = $3,
			category = $4,
			api_role = $5,
			description = $6,
			sort_order = $7,
			active = $8,
			updated_at = NOW()
		WHERE template_key = $1
		RETURNING template_key, title, role_group, category, api_role, description, sort_order, active, created_at, updated_at
	`, templateKey, input.Title, input.RoleGroup, input.Category, input.ApiRole, input.Description, input.SortOrder, input.Active)

	var item OrgStaffRoleTemplate
	if err := row.Scan(
		&item.TemplateKey,
		&item.Title,
		&item.RoleGroup,
		&item.Category,
		&item.ApiRole,
		&item.Description,
		&item.SortOrder,
		&item.Active,
		&item.CreatedAt,
		&item.UpdatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("staff template not found")
		}
		return nil, err
	}

	return &item, nil
}

func (s *OrgApplicationService) SetStaffRoleTemplateStatus(templateKey string, active bool) (*OrgStaffRoleTemplate, error) {
	if s.db == nil {
		return nil, errors.New("staff role templates are unavailable")
	}

	templateKey = strings.TrimSpace(strings.ToLower(templateKey))
	if templateKey == "" {
		return nil, errors.New("template key is required")
	}

	row := s.db.QueryRow(`
		UPDATE staff_role_templates
		SET active = $2, updated_at = NOW()
		WHERE template_key = $1
		RETURNING template_key, title, role_group, category, api_role, description, sort_order, active, created_at, updated_at
	`, templateKey, active)

	var item OrgStaffRoleTemplate
	if err := row.Scan(
		&item.TemplateKey,
		&item.Title,
		&item.RoleGroup,
		&item.Category,
		&item.ApiRole,
		&item.Description,
		&item.SortOrder,
		&item.Active,
		&item.CreatedAt,
		&item.UpdatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("staff template not found")
		}
		return nil, err
	}

	return &item, nil
}

func (s *OrgApplicationService) seedStaffRoleTemplates() error {
	if s.db == nil {
		return nil
	}

	var count int
	if err := s.db.QueryRow(`SELECT COUNT(*) FROM staff_role_templates`).Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}

	seededAt := time.Now().UTC()
	for index, template := range defaultStaffRoleTemplates() {
		_, err := s.db.Exec(`
			INSERT INTO staff_role_templates (
				template_key,
				title,
				role_group,
				category,
				api_role,
				description,
				sort_order,
				active,
				created_at,
				updated_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		`, template.TemplateKey, template.Title, template.RoleGroup, template.Category, template.ApiRole, template.Description, index+1, true, seededAt, seededAt)
		if err != nil {
			return err
		}
	}
	return nil
}

func defaultStaffRoleTemplates() []OrgStaffRoleTemplate {
	return []OrgStaffRoleTemplate{
		{TemplateKey: "super-admin", Title: "Super Admin", RoleGroup: "Governance", Category: "Administration", ApiRole: "superadmin", Description: "Platform owner with full governance access"},
		{TemplateKey: "org-admin", Title: "Organization Admin", RoleGroup: "Governance", Category: "Administration", ApiRole: "admin", Description: "Manages tenant users, services, and local policy"},
		{TemplateKey: "medical-director", Title: "Medical Director", RoleGroup: "Medical", Category: "Leadership", ApiRole: "doctor", Description: "Clinical oversight and escalation authority"},
		{TemplateKey: "physician", Title: "Attending Physician", RoleGroup: "Medical", Category: "Physician", ApiRole: "doctor", Description: "Responsible for diagnosis and treatment planning"},
		{TemplateKey: "triage-nurse", Title: "Triage Nurse", RoleGroup: "Nursing", Category: "Triage", ApiRole: "nurse", Description: "Front-line intake and acuity routing"},
		{TemplateKey: "staff-nurse", Title: "Staff Nurse", RoleGroup: "Nursing", Category: "Ward Care", ApiRole: "nurse", Description: "Ward, outpatient, and procedural nursing support"},
		{TemplateKey: "lab-technologist", Title: "Laboratory Technologist", RoleGroup: "Diagnostics", Category: "Laboratory", ApiRole: "lab", Description: "Specimen processing and laboratory workflows"},
		{TemplateKey: "radiology-technician", Title: "Radiology Technician", RoleGroup: "Diagnostics", Category: "Imaging", ApiRole: "lab", Description: "Imaging workflows and diagnostic support"},
		{TemplateKey: "pharmacy-officer", Title: "Pharmacy Officer", RoleGroup: "Support", Category: "Medication", ApiRole: "pharmacist", Description: "Medication review and dispensing operations"},
		{TemplateKey: "reception-clerk", Title: "Reception Clerk", RoleGroup: "Support", Category: "Front Desk", ApiRole: "reception", Description: "Registration, scheduling, and patient intake"},
		{TemplateKey: "billing-specialist", Title: "Billing Specialist", RoleGroup: "Support", Category: "Finance", ApiRole: "staff", Description: "Claims, payments, and invoice coordination"},
		{TemplateKey: "it-support", Title: "IT Support Engineer", RoleGroup: "IT", Category: "Operations", ApiRole: "staff", Description: "Identity, devices, and platform support"},
	}
}

type rowScanner interface {
	Scan(dest ...any) error
}

func scanOrgApplication(scanner rowScanner) (*OrgApplication, error) {
	var application OrgApplication
	var organizationDomain sql.NullString
	var locationAddress string
	var requestedServicesRaw []byte
	var configuredServicesRaw []byte
	var selectedStaffTemplatesRaw []byte
	var updateRequestedServicesRaw []byte
	var updateRequestNotes sql.NullString
	var updateRequestStatus sql.NullString
	var lastUpdateRequestAt sql.NullTime
	var domainConfiguredAt sql.NullTime
	var approvedBy sql.NullString
	var verifiedAt sql.NullTime
	if err := scanner.Scan(
		&application.ID,
		&application.OrganizationName,
		&application.OrganizationSlug,
		&organizationDomain,
		&application.ContactName,
		&application.ContactEmail,
		&application.ContactPhone,
		&application.LicenseNumber,
		&locationAddress,
		&application.Location.Latitude,
		&application.Location.Longitude,
		&requestedServicesRaw,
		&configuredServicesRaw,
		&selectedStaffTemplatesRaw,
		&updateRequestedServicesRaw,
		&updateRequestNotes,
		&updateRequestStatus,
		&lastUpdateRequestAt,
		&domainConfiguredAt,
		&application.Status,
		&approvedBy,
		&verifiedAt,
		&application.CreatedAt,
		&application.UpdatedAt,
	); err != nil {
		return nil, err
	}

	application.Location.Address = locationAddress
	application.RequestedServices = decodeStringSlice(requestedServicesRaw)
	application.ConfiguredServices = decodeStringSlice(configuredServicesRaw)
	application.SelectedStaffTemplates = decodeStringSlice(selectedStaffTemplatesRaw)
	application.UpdateRequestedServices = decodeStringSlice(updateRequestedServicesRaw)
	if organizationDomain.Valid {
		application.OrganizationDomain = organizationDomain.String
	}
	if updateRequestNotes.Valid {
		application.UpdateRequestNotes = updateRequestNotes.String
	}
	if updateRequestStatus.Valid {
		application.UpdateRequestStatus = updateRequestStatus.String
	}
	if lastUpdateRequestAt.Valid {
		requested := lastUpdateRequestAt.Time.UTC()
		application.LastUpdateRequestAt = &requested
	}
	if domainConfiguredAt.Valid {
		configured := domainConfiguredAt.Time.UTC()
		application.DomainConfiguredAt = &configured
	}
	if approvedBy.Valid {
		application.ApprovedBy = approvedBy.String
	}
	if verifiedAt.Valid {
		verified := verifiedAt.Time.UTC()
		application.VerifiedAt = &verified
	}
	return &application, nil
}

func decodeStringSlice(raw []byte) []string {
	if len(raw) == 0 {
		return []string{}
	}
	var values []string
	if err := json.Unmarshal(raw, &values); err != nil {
		return []string{}
	}
	return uniqueStrings(values)
}

func mustJSON(values []string) []byte {
	encoded, err := json.Marshal(uniqueStrings(values))
	if err != nil {
		return []byte("[]")
	}
	return encoded
}

func uniqueStrings(values []string) []string {
	seen := make(map[string]struct{}, len(values))
	out := make([]string, 0, len(values))
	for _, value := range values {
		trimmed := strings.TrimSpace(value)
		if trimmed == "" {
			continue
		}
		key := strings.ToLower(trimmed)
		if _, ok := seen[key]; ok {
			continue
		}
		seen[key] = struct{}{}
		out = append(out, trimmed)
	}
	return out
}

func slugify(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	if value == "" {
		return ""
	}
	var builder strings.Builder
	lastDash := false
	for _, r := range value {
		switch {
		case r >= 'a' && r <= 'z', r >= '0' && r <= '9':
			builder.WriteRune(r)
			lastDash = false
		case r == ' ' || r == '-' || r == '_' || r == '/':
			if !lastDash && builder.Len() > 0 {
				builder.WriteByte('-')
				lastDash = true
			}
		}
	}
	return strings.Trim(builder.String(), "-")
}

func (s *OrgApplicationService) ensureUniqueSlug(baseSlug string) (string, error) {
	baseSlug = slugify(baseSlug)
	if baseSlug == "" {
		baseSlug = "organization"
	}

	candidate := baseSlug
	for i := 0; i < 50; i++ {
		var exists bool
		err := s.db.QueryRow(`SELECT EXISTS(SELECT 1 FROM org_applications WHERE organization_slug = $1)`, candidate).Scan(&exists)
		if err != nil {
			return "", err
		}
		if !exists {
			return candidate, nil
		}
		candidate = fmt.Sprintf("%s-%d", baseSlug, i+2)
	}
	return "", errors.New("unable to allocate unique organization slug")
}

func newApplicationID() string {
	buffer := make([]byte, 8)
	if _, err := rand.Read(buffer); err != nil {
		return strings.ReplaceAll(time.Now().UTC().Format("20060102150405.000000000"), ".", "")
	}
	return hex.EncodeToString(buffer)
}
