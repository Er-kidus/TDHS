package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"sort"
	"strings"
	"time"
)

func deriveConfiguredFeatures(enabledServices []string, queueEnabled bool) []string {
	serviceSet := map[string]bool{}
	for _, svc := range enabledServices {
		normalized := strings.TrimSpace(strings.ToLower(svc))
		if normalized == "" {
			continue
		}
		serviceSet[normalized] = true
	}

	addFeature := func(out []string, key string, condition bool) []string {
		if !condition {
			return out
		}
		for _, existing := range out {
			if existing == key {
				return out
			}
		}
		return append(out, key)
	}

	features := make([]string, 0, 12)
	features = addFeature(features, "patient_portal_access", serviceSet["emr_access"] || serviceSet["patient_history_tracking"])
	features = addFeature(features, "clinical_decision_support", serviceSet["ai_decision_support"])
	features = addFeature(features, "advanced_case_management", serviceSet["advanced_case_management"])
	features = addFeature(features, "research_data_module", serviceSet["research_data_module"])
	features = addFeature(features, "cross_hospital_exchange", serviceSet["cross_hospital_data_exchange"])
	features = addFeature(features, "audit_tracking", serviceSet["full_compliance_audit_tracking"])
	features = addFeature(features, "emergency_routing", serviceSet["emergency_care"])
	features = addFeature(features, "prescription_validation", serviceSet["prescription_management"])
	features = addFeature(features, "billing_system", serviceSet["inpatient_admission"])
	features = addFeature(features, "queue_management", queueEnabled)
	features = addFeature(features, "sms_notifications", queueEnabled)

	return features
}

func extractEnabledFeatureKeys(featureFlags map[string]any) []string {
	if len(featureFlags) == 0 {
		return []string{}
	}
	keys := make([]string, 0, len(featureFlags))
	for key, value := range featureFlags {
		enabled, ok := value.(bool)
		if ok && enabled {
			keys = append(keys, key)
		}
	}
	sort.Strings(keys)
	return keys
}

func (r *Repository) ListTierRequirements(ctx context.Context) ([]map[string]any, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT tier, description, min_staff, default_services, created_at, updated_at
		FROM organization_tier_requirements
		ORDER BY tier ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]map[string]any, 0)
	for rows.Next() {
		var tier string
		var description string
		var minStaffRaw []byte
		var defaultServicesRaw []byte
		var createdAt time.Time
		var updatedAt time.Time
		if err := rows.Scan(&tier, &description, &minStaffRaw, &defaultServicesRaw, &createdAt, &updatedAt); err != nil {
			return nil, err
		}

		minStaff := map[string]int{}
		_ = json.Unmarshal(minStaffRaw, &minStaff)
		defaultServices := []string{}
		_ = json.Unmarshal(defaultServicesRaw, &defaultServices)

		out = append(out, map[string]any{
			"tier":             tier,
			"description":      description,
			"min_staff":        minStaff,
			"default_services": defaultServices,
			"created_at":       createdAt,
			"updated_at":       updatedAt,
		})
	}

	return out, rows.Err()
}

func (r *Repository) ListOrganizationsWithConfiguration(ctx context.Context, search string) ([]map[string]any, error) {
	if err := r.ensureServiceManagementTable(ctx); err != nil {
		return nil, err
	}

	rows, err := r.db.QueryContext(ctx, `
		SELECT
			o.id,
			o.tenant_id,
			o.name,
			o.slug,
			o.contact_name,
			o.contact_email,
			o.contact_phone,
			o.address,
			o.services,
			COALESCE(oc.tier, sm.tier, 'health-center') AS tier,
			COALESCE(oc.enabled_services, sm.installed_services, o.services, '[]'::jsonb) AS enabled_services,
			COALESCE(oc.min_staff, '{}'::jsonb) AS min_staff,
			COALESCE(oc.queue_enabled, TRUE) AS queue_enabled,
			COALESCE(oc.feature_flags, '{}'::jsonb) AS feature_flags,
			COALESCE(oc.workflow_rules, '{}'::jsonb) AS workflow_rules,
			COALESCE(oc.communication, '{}'::jsonb) AS communication,
			COALESCE(oc.billing, '{}'::jsonb) AS billing,
			COALESCE(staff_counts.count_staff, 0) AS staff_count,
			o.created_at,
			o.updated_at
		FROM organizations o
		LEFT JOIN organization_configurations oc ON oc.organization_id = o.id
		LEFT JOIN service_management_configurations sm ON sm.organization_id = o.id
		LEFT JOIN (
			SELECT organization_id, COUNT(*) AS count_staff
			FROM org_staff_profiles
			GROUP BY organization_id
		) staff_counts ON staff_counts.organization_id = o.id
		WHERE ($1 = '' OR o.name ILIKE '%' || $1 || '%' OR o.slug ILIKE '%' || $1 || '%')
		ORDER BY o.name ASC
	`, search)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]map[string]any, 0)
	for rows.Next() {
		var id string
		var tenantID sql.NullString
		var name string
		var slug string
		var contactName sql.NullString
		var contactEmail sql.NullString
		var contactPhone sql.NullString
		var address sql.NullString
		var servicesRaw []byte
		var tier string
		var enabledServicesRaw []byte
		var minStaffRaw []byte
		var queueEnabled bool
		var featureFlagsRaw []byte
		var workflowRulesRaw []byte
		var communicationRaw []byte
		var billingRaw []byte
		var staffCount int
		var createdAt time.Time
		var updatedAt time.Time
		if err := rows.Scan(
			&id,
			&tenantID,
			&name,
			&slug,
			&contactName,
			&contactEmail,
			&contactPhone,
			&address,
			&servicesRaw,
			&tier,
			&enabledServicesRaw,
			&minStaffRaw,
			&queueEnabled,
			&featureFlagsRaw,
			&workflowRulesRaw,
			&communicationRaw,
			&billingRaw,
			&staffCount,
			&createdAt,
			&updatedAt,
		); err != nil {
			return nil, err
		}

		services := []string{}
		_ = json.Unmarshal(servicesRaw, &services)
		enabledServices := []string{}
		_ = json.Unmarshal(enabledServicesRaw, &enabledServices)
		minStaff := map[string]int{}
		_ = json.Unmarshal(minStaffRaw, &minStaff)
		featureFlags := map[string]any{}
		_ = json.Unmarshal(featureFlagsRaw, &featureFlags)
		workflowRules := map[string]any{}
		_ = json.Unmarshal(workflowRulesRaw, &workflowRules)
		communication := map[string]any{}
		_ = json.Unmarshal(communicationRaw, &communication)
		billing := map[string]any{}
		_ = json.Unmarshal(billingRaw, &billing)

		item := map[string]any{
			"id":               id,
			"name":             name,
			"slug":             slug,
			"tier":             tier,
			"services":         services,
			"enabled_services": enabledServices,
			"enabled_features": deriveConfiguredFeatures(enabledServices, queueEnabled),
			"feature_flags":    featureFlags,
			"workflow_rules":   workflowRules,
			"communication":    communication,
			"billing":          billing,
			"min_staff":        minStaff,
			"queue_enabled":    queueEnabled,
			"staff_count":      staffCount,
			"created_at":       createdAt,
			"updated_at":       updatedAt,
			"tenant_id":        nil,
			"contact_name":     nil,
			"contact_email":    nil,
			"contact_phone":    nil,
			"address":          nil,
		}
		if tenantID.Valid {
			item["tenant_id"] = tenantID.String
		}
		if contactName.Valid {
			item["contact_name"] = contactName.String
		}
		if contactEmail.Valid {
			item["contact_email"] = contactEmail.String
		}
		if contactPhone.Valid {
			item["contact_phone"] = contactPhone.String
		}
		if address.Valid {
			item["address"] = address.String
		}
		out = append(out, item)
	}

	return out, rows.Err()
}

func (r *Repository) GetOrganizationConfiguration(ctx context.Context, organizationID string) (map[string]any, error) {
	if err := r.ensureServiceManagementTable(ctx); err != nil {
		return nil, err
	}

	var (
		id               string
		name             string
		slug             string
		tier             sql.NullString
		enabledServices  []byte
		minStaffRaw      []byte
		queueEnabled     bool
		featureFlagsRaw  []byte
		workflowRulesRaw []byte
		communicationRaw []byte
		billingRaw       []byte
		createdAt        sql.NullTime
		updatedAt        sql.NullTime
		orgServices      []byte
	)

	err := r.db.QueryRowContext(ctx, `
		SELECT
			o.id,
			o.name,
			o.slug,
			COALESCE(oc.tier, sm.tier, 'health-center'),
			COALESCE(oc.enabled_services, sm.installed_services, o.services, '[]'::jsonb),
			COALESCE(oc.min_staff, '{}'::jsonb),
			COALESCE(oc.queue_enabled, TRUE),
			COALESCE(oc.feature_flags, '{}'::jsonb),
			COALESCE(oc.workflow_rules, '{}'::jsonb),
			COALESCE(oc.communication, '{}'::jsonb),
			COALESCE(oc.billing, '{}'::jsonb),
			COALESCE(oc.created_at, sm.created_at),
			COALESCE(oc.updated_at, sm.updated_at),
			o.services
		FROM organizations o
		LEFT JOIN organization_configurations oc ON oc.organization_id = o.id
		LEFT JOIN service_management_configurations sm ON sm.organization_id = o.id
		WHERE o.id = $1
	`, organizationID).Scan(
		&id,
		&name,
		&slug,
		&tier,
		&enabledServices,
		&minStaffRaw,
		&queueEnabled,
		&featureFlagsRaw,
		&workflowRulesRaw,
		&communicationRaw,
		&billingRaw,
		&createdAt,
		&updatedAt,
		&orgServices,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	resolvedTier := "health-center"
	if tier.Valid && tier.String != "" {
		resolvedTier = tier.String
	}

	if len(enabledServices) == 0 {
		enabledServices = orgServices
	}
	if len(enabledServices) == 0 {
		enabledServices = []byte("[]")
	}

	services := []string{}
	_ = json.Unmarshal(enabledServices, &services)
	enabledFeatures := deriveConfiguredFeatures(services, true)
	minStaffMap := map[string]int{}
	_ = json.Unmarshal(minStaffRaw, &minStaffMap)
	if len(minStaffMap) == 0 && tier.Valid && tier.String != "" {
		var tierDefaultsRaw []byte
		_ = r.db.QueryRowContext(ctx, `SELECT min_staff FROM organization_tier_requirements WHERE tier = $1`, resolvedTier).Scan(&tierDefaultsRaw)
		_ = json.Unmarshal(tierDefaultsRaw, &minStaffMap)
	}
	featureFlags := map[string]any{}
	_ = json.Unmarshal(featureFlagsRaw, &featureFlags)
	workflowRules := map[string]any{}
	_ = json.Unmarshal(workflowRulesRaw, &workflowRules)
	communication := map[string]any{}
	_ = json.Unmarshal(communicationRaw, &communication)
	billingMap := map[string]any{}
	_ = json.Unmarshal(billingRaw, &billingMap)
	enabledFeatures = deriveConfiguredFeatures(services, queueEnabled)

	result := map[string]any{
		"organization_id":   id,
		"organization_name": name,
		"organization_slug": slug,
		"tier":              resolvedTier,
		"enabled_services":  services,
		"enabled_features":  enabledFeatures,
		"feature_flags":     featureFlags,
		"workflow_rules":    workflowRules,
		"communication":     communication,
		"billing":           billingMap,
		"min_staff":         minStaffMap,
		"queue_enabled":     queueEnabled,
		"created_at":        nil,
		"updated_at":        nil,
	}
	if createdAt.Valid {
		result["created_at"] = createdAt.Time
	}
	if updatedAt.Valid {
		result["updated_at"] = updatedAt.Time
	}

	return result, nil
}

func (r *Repository) UpsertOrganizationConfiguration(
	ctx context.Context,
	organizationID,
	tier string,
	enabledServices []string,
	minStaff map[string]int,
	queueEnabled bool,
	featureFlags map[string]any,
	workflowRules map[string]any,
	communication map[string]any,
	billing map[string]any,
) (map[string]any, error) {
	if err := r.ensureServiceManagementTable(ctx); err != nil {
		return nil, err
	}

	if tier == "" {
		tier = "health-center"
	}

	servicesJSON, err := json.Marshal(enabledServices)
	if err != nil {
		return nil, err
	}
	minStaffJSON, err := json.Marshal(minStaff)
	if err != nil {
		return nil, err
	}
	featureFlagsJSON, err := json.Marshal(featureFlags)
	if err != nil {
		return nil, err
	}
	workflowRulesJSON, err := json.Marshal(workflowRules)
	if err != nil {
		return nil, err
	}
	communicationJSON, err := json.Marshal(communication)
	if err != nil {
		return nil, err
	}
	billingJSON, err := json.Marshal(billing)
	if err != nil {
		return nil, err
	}

	_, err = r.db.ExecContext(ctx, `
		INSERT INTO organization_configurations (
			organization_id,
			tier,
			enabled_services,
			min_staff,
			queue_enabled,
			feature_flags,
			workflow_rules,
			communication,
			billing
		)
		VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6::jsonb, $7::jsonb, $8::jsonb, $9::jsonb)
		ON CONFLICT (organization_id)
		DO UPDATE SET
			tier = EXCLUDED.tier,
			enabled_services = EXCLUDED.enabled_services,
			min_staff = EXCLUDED.min_staff,
			queue_enabled = EXCLUDED.queue_enabled,
			feature_flags = EXCLUDED.feature_flags,
			workflow_rules = EXCLUDED.workflow_rules,
			communication = EXCLUDED.communication,
			billing = EXCLUDED.billing,
			updated_at = NOW()
	`,
		organizationID,
		tier,
		string(servicesJSON),
		string(minStaffJSON),
		queueEnabled,
		string(featureFlagsJSON),
		string(workflowRulesJSON),
		string(communicationJSON),
		string(billingJSON),
	)
	if err != nil {
		return nil, err
	}

	_, err = r.db.ExecContext(ctx, `
		INSERT INTO service_management_configurations (
			organization_id,
			tier,
			installed_services,
			updated_by
		)
		VALUES ($1, $2, $3::jsonb, NULL)
		ON CONFLICT (organization_id)
		DO UPDATE SET
			tier = EXCLUDED.tier,
			installed_services = EXCLUDED.installed_services,
			updated_at = NOW()
	`,
		organizationID,
		tier,
		string(servicesJSON),
	)
	if err != nil {
		return nil, err
	}

	_, err = r.db.ExecContext(ctx, `
		UPDATE organizations
		SET services = $2::jsonb, updated_at = NOW()
		WHERE id = $1
	`, organizationID, string(servicesJSON))
	if err != nil {
		return nil, err
	}

	return r.GetOrganizationConfiguration(ctx, organizationID)
}

func (r *Repository) ensureServiceManagementTable(ctx context.Context) error {
	_, err := r.db.ExecContext(ctx, `
		CREATE TABLE IF NOT EXISTS service_management_configurations (
			organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
			tier VARCHAR(64) NOT NULL,
			installed_services JSONB NOT NULL DEFAULT '[]'::jsonb,
			updated_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			CONSTRAINT service_management_configurations_tier_check CHECK (
				tier IN (
					'health-post',
					'health-center',
					'primary-hospital',
					'general-specialized-hospital',
					'national-health-system'
				)
			)
		)
	`)
	if err != nil {
		return err
	}

	if _, err := r.db.ExecContext(ctx, `
		CREATE INDEX IF NOT EXISTS idx_service_management_tier
		ON service_management_configurations(tier)
	`); err != nil {
		return err
	}

	if _, err := r.db.ExecContext(ctx, `
		CREATE INDEX IF NOT EXISTS idx_service_management_installed_services
		ON service_management_configurations USING GIN (installed_services)
	`); err != nil {
		return err
	}

	// Backfill rows for organizations that already have install state.
	_, err = r.db.ExecContext(ctx, `
		INSERT INTO service_management_configurations (organization_id, tier, installed_services)
		SELECT
			o.id,
			'health-center' AS tier,
			COALESCE(o.services, '[]'::jsonb) AS installed_services
		FROM organizations o
		WHERE NOT EXISTS (
			SELECT 1
			FROM service_management_configurations sm
			WHERE sm.organization_id = o.id
		)
	`)
	if err != nil {
		return err
	}

	return nil
}

func (r *Repository) GetOrganizationServiceManagementConfiguration(ctx context.Context, organizationID string) (map[string]any, error) {
	if err := r.ensureServiceManagementTable(ctx); err != nil {
		return nil, err
	}

	var (
		id           string
		name         string
		slug         string
		tier         string
		installedRaw []byte
		createdAt    sql.NullTime
		updatedAt    sql.NullTime
	)

	err := r.db.QueryRowContext(ctx, `
		SELECT
			o.id,
			o.name,
			o.slug,
			COALESCE(sm.tier, 'health-center') AS tier,
			COALESCE(sm.installed_services, o.services, tr.default_services, '[]'::jsonb) AS installed_services,
			sm.created_at,
			sm.updated_at
		FROM organizations o
		LEFT JOIN service_management_configurations sm ON sm.organization_id = o.id
		LEFT JOIN organization_tier_requirements tr ON tr.tier = COALESCE(sm.tier, 'health-center')
		WHERE o.id = $1
	`, organizationID).Scan(&id, &name, &slug, &tier, &installedRaw, &createdAt, &updatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	if len(installedRaw) == 0 {
		installedRaw = []byte("[]")
	}

	installed := []string{}
	_ = json.Unmarshal(installedRaw, &installed)

	result := map[string]any{
		"organization_id":    id,
		"organization_name":  name,
		"organization_slug":  slug,
		"tier":               tier,
		"installed_services": installed,
		"created_at":         nil,
		"updated_at":         nil,
	}
	if createdAt.Valid {
		result["created_at"] = createdAt.Time
	}
	if updatedAt.Valid {
		result["updated_at"] = updatedAt.Time
	}

	return result, nil
}

func (r *Repository) UpsertOrganizationServiceManagementConfiguration(
	ctx context.Context,
	organizationID,
	tier string,
	installedServices []string,
	updatedBy string,
) (map[string]any, error) {
	if err := r.ensureServiceManagementTable(ctx); err != nil {
		return nil, err
	}

	if tier == "" {
		tier = "health-center"
	}

	servicesJSON, err := json.Marshal(installedServices)
	if err != nil {
		return nil, err
	}

	_, err = r.db.ExecContext(ctx, `
		INSERT INTO service_management_configurations (
			organization_id,
			tier,
			installed_services,
			updated_by
		)
		VALUES ($1, $2, $3::jsonb, NULLIF($4, ''))
		ON CONFLICT (organization_id)
		DO UPDATE SET
			tier = EXCLUDED.tier,
			installed_services = EXCLUDED.installed_services,
			updated_by = EXCLUDED.updated_by,
			updated_at = NOW()
	`, organizationID, tier, string(servicesJSON), strings.TrimSpace(updatedBy))
	if err != nil {
		return nil, err
	}

	_, err = r.db.ExecContext(ctx, `
		UPDATE organizations
		SET services = $2::jsonb, updated_at = NOW()
		WHERE id = $1
	`, organizationID, string(servicesJSON))
	if err != nil {
		return nil, err
	}

	return r.GetOrganizationServiceManagementConfiguration(ctx, organizationID)
}

func (r *Repository) ListOrganizationStaff(ctx context.Context, organizationID string, limit int) ([]map[string]any, error) {
	if limit <= 0 || limit > 500 {
		limit = 100
	}

	rows, err := r.db.QueryContext(ctx, `
		SELECT
			u.id,
			sp.organization_id,
			u.full_name,
			u.email,
			u.active,
			COALESCE(roles.name, sp.role, 'staff') AS role,
			sp.staff_template_key,
			sp.professional_title,
			sp.license_number,
			COALESCE(sp.telemedicine_enabled, FALSE),
			sp.telemedicine_specialty,
			COALESCE(sp.telemedicine_rate, 0),
			COALESCE(sp.telemedicine_currency, 'ETB'),
			COALESCE(sp.telemedicine_modes, '["video","voice","chat"]'::jsonb),
			u.created_at,
			u.updated_at
		FROM users u
		INNER JOIN org_staff_profiles sp ON sp.user_id = u.id AND sp.organization_id = $1
		LEFT JOIN user_roles ur ON ur.user_id = u.id
		LEFT JOIN roles ON roles.id = ur.role_id
		WHERE LOWER(COALESCE(roles.name, sp.role, 'staff')) NOT IN ('admin', 'superadmin', 'super-admin', 'super_admin')
		ORDER BY u.created_at DESC
		LIMIT $2
	`, organizationID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]map[string]any, 0)
	for rows.Next() {
		var id, organizationIDValue, fullName, email, role string
		var active bool
		var staffTemplateKey sql.NullString
		var professionalTitle sql.NullString
		var licenseNumber sql.NullString
		var telemedicineEnabled bool
		var telemedicineSpecialty sql.NullString
		var telemedicineRate float64
		var telemedicineCurrency string
		var telemedicineModesRaw []byte
		var createdAt, updatedAt time.Time
		if err := rows.Scan(&id, &organizationIDValue, &fullName, &email, &active, &role, &staffTemplateKey, &professionalTitle, &licenseNumber, &telemedicineEnabled, &telemedicineSpecialty, &telemedicineRate, &telemedicineCurrency, &telemedicineModesRaw, &createdAt, &updatedAt); err != nil {
			return nil, err
		}
		telemedicineModes := []string{"video", "voice", "chat"}
		if len(telemedicineModesRaw) > 0 {
			_ = json.Unmarshal(telemedicineModesRaw, &telemedicineModes)
		}
		item := map[string]any{
			"id":                     id,
			"organization_id":        organizationIDValue,
			"full_name":              fullName,
			"email":                  email,
			"active":                 active,
			"role":                   role,
			"staff_template_key":     nil,
			"professional_title":     nil,
			"license_number":         nil,
			"telemedicine_enabled":   telemedicineEnabled,
			"telemedicine_specialty": nil,
			"telemedicine_rate":      telemedicineRate,
			"telemedicine_currency":  telemedicineCurrency,
			"telemedicine_modes":     telemedicineModes,
			"created_at":             createdAt,
			"updated_at":             updatedAt,
		}
		if staffTemplateKey.Valid {
			item["staff_template_key"] = staffTemplateKey.String
		}
		if professionalTitle.Valid {
			item["professional_title"] = professionalTitle.String
		}
		if licenseNumber.Valid {
			item["license_number"] = licenseNumber.String
		}
		if telemedicineSpecialty.Valid {
			item["telemedicine_specialty"] = telemedicineSpecialty.String
		}
		out = append(out, item)
	}

	return out, rows.Err()
}

func (r *Repository) CreateOrganizationStaff(ctx context.Context, organizationID, fullName, email, passwordHash, authRole, profileRole, staffTemplateKey, professionalTitle, licenseNumber string, telemedicineEnabled bool, telemedicineSpecialty string, telemedicineRate float64, telemedicineCurrency string, telemedicineModes []string) (map[string]any, error) {
	var userID string
	var createdAt time.Time
	telemedicineModesJSON, err := json.Marshal(telemedicineModes)
	if err != nil {
		return nil, err
	}
	err = r.db.QueryRowContext(ctx, `
		WITH org_ref AS (
			SELECT id, tenant_id FROM organizations WHERE id = $1
		), new_user AS (
			INSERT INTO users (tenant_id, organization_id, full_name, email, password_hash, active)
			SELECT org_ref.tenant_id, org_ref.id, $2, $3, $4, true
			FROM org_ref
			RETURNING id, created_at
		), role_ref AS (
			SELECT id FROM roles WHERE name = $5
		), role_assign AS (
			INSERT INTO user_roles (user_id, role_id)
			SELECT new_user.id, role_ref.id
			FROM new_user, role_ref
			ON CONFLICT DO NOTHING
		), profile AS (
			INSERT INTO org_staff_profiles (user_id, organization_id, role, staff_template_key, professional_title, license_number, telemedicine_enabled, telemedicine_specialty, telemedicine_rate, telemedicine_currency, telemedicine_modes)
			SELECT new_user.id, $1, $6, NULLIF($7, ''), NULLIF($8, ''), NULLIF($9, ''), $10, NULLIF($11, ''), $12, NULLIF($13, ''), $14::jsonb
			FROM new_user
			ON CONFLICT (user_id)
			DO UPDATE SET
				organization_id = EXCLUDED.organization_id,
				role = EXCLUDED.role,
				staff_template_key = EXCLUDED.staff_template_key,
				professional_title = EXCLUDED.professional_title,
				license_number = EXCLUDED.license_number,
				telemedicine_enabled = EXCLUDED.telemedicine_enabled,
				telemedicine_specialty = EXCLUDED.telemedicine_specialty,
				telemedicine_rate = EXCLUDED.telemedicine_rate,
				telemedicine_currency = EXCLUDED.telemedicine_currency,
				telemedicine_modes = EXCLUDED.telemedicine_modes,
				updated_at = NOW()
		)
		SELECT id, created_at FROM new_user
	`, organizationID, fullName, email, passwordHash, authRole, profileRole, staffTemplateKey, professionalTitle, licenseNumber, telemedicineEnabled, telemedicineSpecialty, telemedicineRate, telemedicineCurrency, string(telemedicineModesJSON)).Scan(&userID, &createdAt)
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"id":                     userID,
		"organization_id":        organizationID,
		"full_name":              fullName,
		"email":                  email,
		"role":                   profileRole,
		"auth_role":              authRole,
		"staff_template_key":     staffTemplateKey,
		"professional_title":     professionalTitle,
		"license_number":         licenseNumber,
		"telemedicine_enabled":   telemedicineEnabled,
		"telemedicine_specialty": telemedicineSpecialty,
		"telemedicine_rate":      telemedicineRate,
		"telemedicine_currency":  telemedicineCurrency,
		"telemedicine_modes":     telemedicineModes,
		"active":                 true,
		"created_at":             createdAt,
	}, nil
}

func (r *Repository) UpdateOrganizationStaff(ctx context.Context, organizationID, userID string, fullName, authRole, profileRole, staffTemplateKey, professionalTitle, licenseNumber *string, active *bool, telemedicineEnabled *bool, telemedicineSpecialty *string, telemedicineRate *float64, telemedicineCurrency *string, telemedicineModes *[]string) (map[string]any, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	var exists bool
	if err := tx.QueryRowContext(ctx, `
		SELECT EXISTS (
			SELECT 1
			FROM users u
			LEFT JOIN org_staff_profiles sp ON sp.user_id = u.id
			WHERE u.id = $1 AND COALESCE(sp.organization_id, u.organization_id) = $2
		)
	`, userID, organizationID).Scan(&exists); err != nil {
		return nil, err
	}
	if !exists {
		return nil, ErrNotFound
	}

	if fullName != nil {
		trimmed := *fullName
		if trimmed != "" {
			if _, err := tx.ExecContext(ctx, `UPDATE users SET full_name = $2, updated_at = NOW() WHERE id = $1`, userID, trimmed); err != nil {
				return nil, err
			}
		}
	}

	if active != nil {
		if _, err := tx.ExecContext(ctx, `UPDATE users SET active = $2, updated_at = NOW() WHERE id = $1`, userID, *active); err != nil {
			return nil, err
		}
	}

	if authRole != nil {
		if _, err := tx.ExecContext(ctx, `DELETE FROM user_roles WHERE user_id = $1`, userID); err != nil {
			return nil, err
		}
		if _, err := tx.ExecContext(ctx, `
			INSERT INTO user_roles (user_id, role_id)
			SELECT $1, id FROM roles WHERE name = $2
			ON CONFLICT DO NOTHING
		`, userID, *authRole); err != nil {
			return nil, err
		}
	}

	if profileRole != nil || staffTemplateKey != nil || professionalTitle != nil || licenseNumber != nil || telemedicineEnabled != nil || telemedicineSpecialty != nil || telemedicineRate != nil || telemedicineCurrency != nil || telemedicineModes != nil {
		telemedicineModesJSON, err := jsonSliceOrNil(telemedicineModes)
		if err != nil {
			return nil, err
		}
		if _, err := tx.ExecContext(ctx, `
			INSERT INTO org_staff_profiles (user_id, organization_id, role, staff_template_key, professional_title, license_number, telemedicine_enabled, telemedicine_specialty, telemedicine_rate, telemedicine_currency, telemedicine_modes)
			VALUES (
				$1,
				$2,
				COALESCE(NULLIF($3, ''), 'staff'),
				NULLIF($4, ''),
				NULLIF($5, ''),
				NULLIF($6, ''),
				COALESCE($7, FALSE),
				NULLIF($8, ''),
				COALESCE($9, 0),
				COALESCE(NULLIF($10, ''), 'ETB'),
				COALESCE($11::jsonb, '["video","voice","chat"]'::jsonb)
			)
			ON CONFLICT (user_id)
			DO UPDATE SET
				organization_id = EXCLUDED.organization_id,
				role = COALESCE(NULLIF($3, ''), org_staff_profiles.role),
				staff_template_key = COALESCE(NULLIF($4, ''), org_staff_profiles.staff_template_key),
				professional_title = COALESCE(NULLIF($5, ''), org_staff_profiles.professional_title),
				license_number = COALESCE(NULLIF($6, ''), org_staff_profiles.license_number),
				telemedicine_enabled = COALESCE($7, org_staff_profiles.telemedicine_enabled),
				telemedicine_specialty = COALESCE(NULLIF($8, ''), org_staff_profiles.telemedicine_specialty),
				telemedicine_rate = COALESCE($9, org_staff_profiles.telemedicine_rate),
				telemedicine_currency = COALESCE(NULLIF($10, ''), org_staff_profiles.telemedicine_currency),
				telemedicine_modes = COALESCE($11::jsonb, org_staff_profiles.telemedicine_modes),
				updated_at = NOW()
		`, userID, organizationID, stringOrEmpty(profileRole), stringOrEmpty(staffTemplateKey), stringOrEmpty(professionalTitle), stringOrEmpty(licenseNumber), telemedicineEnabled, stringOrEmpty(telemedicineSpecialty), telemedicineRate, stringOrEmpty(telemedicineCurrency), telemedicineModesJSON); err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	items, err := r.ListOrganizationStaff(ctx, organizationID, 500)
	if err != nil {
		return nil, err
	}
	for _, item := range items {
		if id, ok := item["id"].(string); ok && id == userID {
			return item, nil
		}
	}
	return nil, ErrNotFound
}

func (r *Repository) DeleteOrganizationStaff(ctx context.Context, organizationID, userID string) error {
	res, err := r.db.ExecContext(ctx, `
		DELETE FROM users
		WHERE id = $1
		  AND EXISTS (
			SELECT 1
			FROM users u
			LEFT JOIN org_staff_profiles sp ON sp.user_id = u.id
			WHERE u.id = $1 AND COALESCE(sp.organization_id, u.organization_id) = $2
		)
	`, userID, organizationID)
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

func stringOrEmpty(input *string) string {
	if input == nil {
		return ""
	}
	return *input
}

func jsonSliceOrNil(input *[]string) (*string, error) {
	if input == nil {
		return nil, nil
	}
	encoded, err := json.Marshal(*input)
	if err != nil {
		return nil, err
	}
	value := string(encoded)
	return &value, nil
}
