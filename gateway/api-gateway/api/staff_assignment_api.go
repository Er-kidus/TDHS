//go:build legacy_staff_api

// staff_assignment_api.go
// Staff member assignment and profile management

package api

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// StaffAssignmentRequest represents a new staff member assignment
type StaffAssignmentRequest struct {
	UserID            string `json:"user_id"`
	Email             string `json:"email"`
	FullName          string `json:"full_name"`
	StaffTemplateKey  string `json:"staff_template_key"`
	ProfessionalTitle string `json:"professional_title"`
	LicenseNumber     string `json:"license_number"`
	Role              string `json:"role"`
	Active            bool   `json:"active"`
}

// StaffProfile represents an organization staff member
type StaffProfile struct {
	ID                 string    `json:"id"`
	OrganizationID     string    `json:"organization_id"`
	UserID             string    `json:"user_id"`
	Email              string    `json:"email"`
	FullName           string    `json:"full_name"`
	StaffTemplateKey   string    `json:"staff_template_key"`
	StaffTemplateTitle string    `json:"staff_template_title,omitempty"`
	Role               string    `json:"role"`
	ProfessionalTitle  string    `json:"professional_title"`
	LicenseNumber      string    `json:"license_number"`
	Active             bool      `json:"active"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

// CreateStaffAssignment creates a new staff member assignment
func (r *Router) CreateStaffAssignment(w http.ResponseWriter, req *http.Request) {
	orgID := req.PathValue("org_id")

	// Check authorization: org admin or higher
	if !r.isOrgAdminOrHigher(req, orgID) {
		http.Error(w, "Unauthorized - Org Admin or higher required", http.StatusForbidden)
		return
	}

	// var body StaffAssignmentRequest
	// if err := json.NewDecoder(req.Body).Decode(&body); err != nil {
	// 	http.Error(w, fmt.Sprintf("Invalid request body: %v", err), http.StatusBadRequest)
	// 	return
	// }

	bodyBytes, _ := io.ReadAll(req.Body)
	fmt.Println(">>> RAW REQUEST BODY:", string(bodyBytes))
	req.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	dec := json.NewDecoder(req.Body)

	// 🔥 IMPORTANT: forces Go to complain about unexpected fields like "active"
	// dec.DisallowUnknownFields()

	var body StaffAssignmentRequest

	if err := dec.Decode(&body); err != nil {
		fmt.Println(">>> JSON DECODE FAILED")
		fmt.Printf(">>> ERROR: %+v\n", err)

		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	fmt.Printf(">>> DECODED STRUCT: %+v\n", body)

	// Validate required fields
	if body.FullName == "" || body.Email == "" || body.StaffTemplateKey == "" {
		http.Error(w, "Missing required fields: full_name, email, staff_template_key", http.StatusBadRequest)
		return
	}

	active := false
	if body.Active != nil {
		active = *body.Active
	}

	// Validate and map role before proceeding
	validatedRole, err := r.validateAndMapRole(body.StaffTemplateKey, body.Role)
	if err != nil {
		// Get available roles for helpful error response
		availableRoles, _ := r.getValidRoles()
		errorResponse := map[string]interface{}{
			"error":           "Invalid role",
			"message":         err.Error(),
			"available_roles": availableRoles,
			"staff_template":  body.StaffTemplateKey,
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(errorResponse)
		return
	}
	body.Role = validatedRole

	// 1. Check if staff template is approved for this organization
	var requestStatus string
	err := r.db.QueryRow(`
		SELECT status FROM organization_staff_template_requests
		WHERE organization_id = $1 AND staff_template_key = $2
	`, orgID, body.StaffTemplateKey).Scan(&requestStatus)

	if err == sql.ErrNoRows {
		http.Error(w, fmt.Sprintf("Staff template '%s' not approved for this organization", body.StaffTemplateKey), http.StatusForbidden)
		return
	}
	if err != nil {
		http.Error(w, fmt.Sprintf("Database error: %v", err), http.StatusInternalServerError)
		return
	}

	if requestStatus != "approved" {
		http.Error(w, fmt.Sprintf("Staff template status is '%s', must be 'approved'", requestStatus), http.StatusForbidden)
		return
	}

	// 2. Validate staff template is available for org tier
	var tier string
	err = r.db.QueryRow(`
		SELECT tier FROM organization_configurations WHERE organization_id = $1
	`, orgID).Scan(&tier)

	if err != nil {
		http.Error(w, "Organization configuration not found", http.StatusInternalServerError)
		return
	}

	// 3. Check tier restriction
	var tierAccess int
	err = r.db.QueryRow(`
		SELECT COUNT(*) FROM staff_template_tier_access
		WHERE staff_template_key = $1 AND organization_tier = $2
	`, body.StaffTemplateKey, tier).Scan(&tierAccess)

	if err != nil || tierAccess == 0 {
		http.Error(w, fmt.Sprintf("Staff template '%s' not available for tier '%s'", body.StaffTemplateKey, tier), http.StatusForbidden)
		return
	}

	// 4. Check if user exists, if not create them
	var userID string
	err = r.db.QueryRow(`
		SELECT id FROM users WHERE email = $1
	`, body.Email).Scan(&userID)

	if err == sql.ErrNoRows {
		// Create new user
		userID = generateUUID()
		_, err := r.db.Exec(`
			INSERT INTO users (id, tenant_id, organization_id, full_name, email, password_hash, active)
			VALUES ($1, (SELECT id FROM tenants WHERE slug = 'default'), $2, $3, $4, $5, TRUE)
		`, userID, orgID, body.FullName, body.Email, "placeholder_hash")

		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to create user: %v", err), http.StatusInternalServerError)
			return
		}
	} else if err != nil {
		http.Error(w, fmt.Sprintf("Database error: %v", err), http.StatusInternalServerError)
		return
	}

	// 5. Get role ID from role name
	roleID, err := r.getRoleIDByName(body.Role)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to resolve role ID for role '%s': %v", body.Role, err), http.StatusInternalServerError)
		return
	}

	// 6. Create staff profile
	staffProfileID := generateUUID()
	_, err = r.db.Exec(`
		INSERT INTO org_staff_profiles (
			id,
			user_id,
			organization_id,
			staff_template_key,
			role,
			professional_title,
			license_number,
			active
		) VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
	`,
		staffProfileID,
		userID,
		orgID,
		body.StaffTemplateKey,
		body.Role,
		body.ProfessionalTitle,
		body.LicenseNumber,
		active,
	)

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to create staff profile: %v", err), http.StatusInternalServerError)
		return
	}

	// 7. Log audit event
	currentUserID := r.getUserIDFromContext(req)
	_ = r.AuditStaffChanges(currentUserID, orgID, "staff_assigned", body.StaffTemplateKey, fmt.Sprintf("Assigned %s (%s) to %s with role %s", body.FullName, body.Email, body.StaffTemplateKey, body.Role))

	// 8. Return success
	response := map[string]interface{}{
		"status":           "success",
		"message":          "Staff member assigned successfully",
		"staff_profile_id": staffProfileID,
		"user_id":          userID,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// GetOrganizationStaff returns all staff members for an organization
func (r *Router) GetOrganizationStaff(w http.ResponseWriter, req *http.Request) {
	orgID := req.PathValue("org_id")

	// Check authorization
	if !r.isOrgAdminOrSuperAdmin(req, orgID) {
		http.Error(w, "Unauthorized", http.StatusForbidden)
		return
	}

	rows, err := r.db.Query(`
		SELECT 
			osp.id,
			osp.organization_id,
			osp.user_id,
			u.email,
			u.full_name,
			osp.staff_template_key,
			st.title,
			osp.role,
			osp.professional_title,
			osp.license_number,
			osp.active,
			osp.created_at,
			osp.updated_at
		FROM org_staff_profiles osp
		JOIN users u ON osp.user_id = u.id
		JOIN staff_role_templates st ON osp.staff_template_key = st.template_key
		WHERE osp.organization_id = $1
		ORDER BY u.full_name ASC
	`, orgID)

	if err != nil {
		http.Error(w, fmt.Sprintf("Database error: %v", err), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var staff []StaffProfile
	for rows.Next() {
		var s StaffProfile
		err := rows.Scan(
			&s.ID, &s.OrganizationID, &s.UserID, &s.Email, &s.FullName,
			&s.StaffTemplateKey, &s.StaffTemplateTitle, &s.Role,
			&s.ProfessionalTitle, &s.LicenseNumber, &s.Active,
			&s.CreatedAt, &s.UpdatedAt,
		)
		if err != nil {
			http.Error(w, fmt.Sprintf("Scan error: %v", err), http.StatusInternalServerError)
			return
		}
		staff = append(staff, s)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(staff)
}

// GetStaffMember returns a single staff member
func (r *Router) GetStaffMember(w http.ResponseWriter, req *http.Request) {
	orgID := req.PathValue("org_id")
	staffID := req.PathValue("staff_id")

	// Check authorization
	if !r.isOrgAdminOrSuperAdmin(req, orgID) {
		http.Error(w, "Unauthorized", http.StatusForbidden)
		return
	}

	var s StaffProfile
	err := r.db.QueryRow(`
		SELECT 
			osp.id,
			osp.organization_id,
			osp.user_id,
			u.email,
			u.full_name,
			osp.staff_template_key,
			st.title,
			osp.role,
			osp.professional_title,
			osp.license_number,
			osp.active,
			osp.created_at,
			osp.updated_at
		FROM org_staff_profiles osp
		JOIN users u ON osp.user_id = u.id
		JOIN staff_role_templates st ON osp.staff_template_key = st.template_key
		WHERE osp.id = $1 AND osp.organization_id = $2
	`, staffID, orgID).Scan(
		&s.ID, &s.OrganizationID, &s.UserID, &s.Email, &s.FullName,
		&s.StaffTemplateKey, &s.StaffTemplateTitle, &s.Role,
		&s.ProfessionalTitle, &s.LicenseNumber, &s.Active,
		&s.CreatedAt, &s.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		http.Error(w, "Staff member not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, fmt.Sprintf("Database error: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(s)
}

// UpdateStaffMember updates a staff member
func (r *Router) UpdateStaffMember(w http.ResponseWriter, req *http.Request) {
	orgID := req.PathValue("org_id")
	staffID := req.PathValue("staff_id")

	// Check authorization
	if !r.isOrgAdminOrHigher(req, orgID) {
		http.Error(w, "Unauthorized", http.StatusForbidden)
		return
	}

	var body struct {
		ProfessionalTitle string `json:"professional_title"`
		LicenseNumber     string `json:"license_number"`
		Active            bool   `json:"active"`
	}

	if err := json.NewDecoder(req.Body).Decode(&body); err != nil {
		http.Error(w, fmt.Sprintf("Invalid request body: %v", err), http.StatusBadRequest)
		return
	}

	// Update staff profile
	result, err := r.db.Exec(`
		UPDATE org_staff_profiles
		SET professional_title = $1,
			license_number = $2,
			active = $3,
			updated_at = NOW()
		WHERE id = $4 AND organization_id = $5
	`, body.ProfessionalTitle, body.LicenseNumber, body.Active, staffID, orgID)

	if err != nil {
		http.Error(w, fmt.Sprintf("Update error: %v", err), http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Staff member not found", http.StatusNotFound)
		return
	}

	// Log audit event
	currentUserID := r.getUserIDFromContext(req)
	_ = r.AuditStaffChanges(currentUserID, orgID, "staff_updated", "", fmt.Sprintf("Updated staff member %s", staffID))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Staff member updated"})
}

// DeleteStaffMember removes a staff member (soft delete via active flag)
func (r *Router) DeleteStaffMember(w http.ResponseWriter, req *http.Request) {
	orgID := req.PathValue("org_id")
	staffID := req.PathValue("staff_id")

	// Check authorization
	if !r.isOrgAdminOrHigher(req, orgID) {
		http.Error(w, "Unauthorized", http.StatusForbidden)
		return
	}

	// Soft delete - just mark as inactive
	result, err := r.db.Exec(`
		UPDATE org_staff_profiles
		SET active = FALSE,
			updated_at = NOW()
		WHERE id = $1 AND organization_id = $2
	`, staffID, orgID)

	if err != nil {
		http.Error(w, fmt.Sprintf("Delete error: %v", err), http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Staff member not found", http.StatusNotFound)
		return
	}

	// Log audit event
	currentUserID := r.getUserIDFromContext(req)
	_ = r.AuditStaffChanges(currentUserID, orgID, "staff_removed", "", fmt.Sprintf("Removed staff member %s", staffID))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Staff member removed"})
}

// validateAndMapRole validates the role and maps it from staff template if needed
func (r *Router) validateAndMapRole(staffTemplateKey, requestedRole string) (string, error) {
	role := requestedRole

	// If no role provided, try to map from staff template
	if role == "" {
		// Get the api_role from staff template
		var mappedRole sql.NullString
		err := r.db.QueryRow(`
			SELECT api_role FROM staff_role_templates
			WHERE template_key = $1
		`, staffTemplateKey).Scan(&mappedRole)

		if err == sql.ErrNoRows {
			return "", fmt.Errorf("staff template '%s' not found", staffTemplateKey)
		}
		if err != nil {
			return "", fmt.Errorf("database error: %v", err)
		}

		if !mappedRole.Valid || mappedRole.String == "" {
			return "", fmt.Errorf("staff template '%s' has no mapped role", staffTemplateKey)
		}

		role = mappedRole.String
	}

	// Validate that the role exists in the roles table
	var roleExists int
	err := r.db.QueryRow(`
		SELECT COUNT(*) FROM roles
		WHERE name = $1 AND active = TRUE
	`, role).Scan(&roleExists)

	if err != nil {
		return "", fmt.Errorf("database error checking role: %v", err)
	}

	if roleExists == 0 {
		return "", fmt.Errorf("unsupported role '%s' - role does not exist or is inactive", role)
	}

	return role, nil
}

// getValidRoles returns a list of all valid, active roles
func (r *Router) getValidRoles() ([]string, error) {
	rows, err := r.db.Query(`
		SELECT name FROM roles
		WHERE active = TRUE
		ORDER BY name ASC
	`)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var roles []string
	for rows.Next() {
		var roleName string
		if err := rows.Scan(&roleName); err != nil {
			return nil, err
		}
		roles = append(roles, roleName)
	}

	return roles, nil
}

// getRoleIDByName gets the ID of a role by its name
func (r *Router) getRoleIDByName(roleName string) (string, error) {
	var roleID string
	err := r.db.QueryRow(`
		SELECT id FROM roles
		WHERE name = $1 AND active = TRUE
	`, roleName).Scan(&roleID)

	if err == sql.ErrNoRows {
		return "", fmt.Errorf("role '%s' not found", roleName)
	}
	if err != nil {
		return "", fmt.Errorf("database error: %v", err)
	}

	return roleID, nil
}

// Helper function to generate UUID
func generateUUID() string {
	// In production, use github.com/google/uuid
	// For now, this is a placeholder
	return ""
}
