//go:build legacy_staff_api

// staff_api.go
// Staff Template Management API - Super Admin endpoints

package api

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// StaffTemplateRequest represents a staff role request
type StaffTemplateRequest struct {
	ID                 string     `json:"id"`
	OrganizationID     string     `json:"organization_id"`
	OrganizationName   string     `json:"organization_name,omitempty"`
	OrganizationTier   string     `json:"organization_tier,omitempty"`
	StaffTemplateKey   string     `json:"staff_template_key"`
	StaffTemplateTitle string     `json:"staff_template_title,omitempty"`
	RequestedByEmail   string     `json:"requested_by_email,omitempty"`
	Status             string     `json:"status"` // pending, approved, rejected, revoked
	Justification      string     `json:"justification"`
	ApprovalNotes      string     `json:"approval_notes,omitempty"`
	ApprovedByEmail    string     `json:"approved_by_email,omitempty"`
	ApprovedAt         *time.Time `json:"approved_at,omitempty"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
}

// StaffTemplateResponse represents a staff role template
type StaffTemplateResponse struct {
	TemplateKey      string `json:"template_key"`
	Title            string `json:"title"`
	RoleGroup        string `json:"role_group"`
	Category         string `json:"category"`
	APIRole          string `json:"api_role"`
	Description      string `json:"description"`
	SortOrder        int    `json:"sort_order"`
	Active           bool   `json:"active"`
	MinStaffRequired int    `json:"min_staff_required,omitempty"`
	AvailableTier    string `json:"available_tier,omitempty"`
}

// ApprovalRequest represents an approval action
type ApprovalRequest struct {
	ApprovalNotes string `json:"approval_notes"`
	Status        string `json:"status"` // approved or rejected or revoked
	Reason        string `json:"reason"`
}

// StaffComplianceReport represents organization staffing compliance
type StaffComplianceReport struct {
	OrganizationID     string                  `json:"organization_id"`
	OrganizationName   string                  `json:"organization_name"`
	OrganizationTier   string                  `json:"organization_tier"`
	TotalApprovedStaff int                     `json:"total_approved_staff"`
	MinimumRequired    int                     `json:"minimum_required"`
	ComplianceStatus   string                  `json:"compliance_status"` // compliant, at_risk, non_compliant
	MissingRoles       []MissingStaffRole      `json:"missing_roles,omitempty"`
	UnauthorizedRoles  []UnauthorizedStaffRole `json:"unauthorized_roles,omitempty"`
	LastCheckedAt      time.Time               `json:"last_checked_at"`
}

type MissingStaffRole struct {
	TemplateKey string `json:"template_key"`
	Title       string `json:"title"`
	Required    int    `json:"required"`
	Current     int    `json:"current"`
}

type UnauthorizedStaffRole struct {
	TemplateKey string `json:"template_key"`
	Title       string `json:"title"`
	Count       int    `json:"count"`
	Reason      string `json:"reason"`
}

// GetPendingStaffRequests returns all pending staff template requests
func (r *Router) GetPendingStaffRequests(w http.ResponseWriter, req *http.Request) {
	// Check if user is super admin
	if !r.isUserSuperAdmin(req) {
		http.Error(w, "Unauthorized", http.StatusForbidden)
		return
	}

	rows, err := r.db.Query(`
		SELECT 
			ostr.id,
			ostr.organization_id,
			org.name,
			org_config.tier,
			ostr.staff_template_key,
			st.title,
			req_user.email,
			ostr.status,
			ostr.justification,
			ostr.approval_notes,
			app_user.email,
			ostr.approved_at,
			ostr.created_at,
			ostr.updated_at
		FROM organization_staff_template_requests ostr
		JOIN organizations org ON ostr.organization_id = org.id
		JOIN staff_role_templates st ON ostr.staff_template_key = st.template_key
		JOIN users req_user ON ostr.requested_by = req_user.id
		LEFT JOIN users app_user ON ostr.approved_by = app_user.id
		LEFT JOIN organization_configurations org_config ON org.id = org_config.organization_id
		WHERE ostr.status = 'pending'
		ORDER BY ostr.created_at DESC
	`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var requests []StaffTemplateRequest
	for rows.Next() {
		var r StaffTemplateRequest
		var approvedAt sql.NullTime
		var approvedByEmail sql.NullString

		err := rows.Scan(
			&r.ID, &r.OrganizationID, &r.OrganizationName, &r.OrganizationTier,
			&r.StaffTemplateKey, &r.StaffTemplateTitle, &r.RequestedByEmail,
			&r.Status, &r.Justification, &r.ApprovalNotes, &approvedByEmail,
			&approvedAt, &r.CreatedAt, &r.UpdatedAt,
		)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if approvedAt.Valid {
			r.ApprovedAt = &approvedAt.Time
		}
		if approvedByEmail.Valid {
			r.ApprovedByEmail = approvedByEmail.String
		}

		requests = append(requests, r)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(requests)
}

// GetOrganizationStaffRequests returns all staff requests for an organization
func (r *Router) GetOrganizationStaffRequests(w http.ResponseWriter, req *http.Request) {
	orgID := req.PathValue("org_id")

	// Check authorization: org admin or super admin
	if !r.isOrgAdminOrSuperAdmin(req, orgID) {
		http.Error(w, "Unauthorized", http.StatusForbidden)
		return
	}

	rows, err := r.db.Query(`
		SELECT 
			ostr.id,
			ostr.organization_id,
			org.name,
			org_config.tier,
			ostr.staff_template_key,
			st.title,
			st.category,
			req_user.email,
			ostr.status,
			ostr.justification,
			ostr.approval_notes,
			app_user.email,
			ostr.approved_at,
			ostr.created_at,
			ostr.updated_at
		FROM organization_staff_template_requests ostr
		JOIN organizations org ON ostr.organization_id = org.id
		JOIN staff_role_templates st ON ostr.staff_template_key = st.template_key
		JOIN users req_user ON ostr.requested_by = req_user.id
		LEFT JOIN users app_user ON ostr.approved_by = app_user.id
		LEFT JOIN organization_configurations org_config ON org.id = org_config.organization_id
		WHERE ostr.organization_id = $1
		ORDER BY ostr.created_at DESC
	`, orgID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var requests []StaffTemplateRequest
	for rows.Next() {
		var r StaffTemplateRequest
		var approvedAt sql.NullTime
		var approvedByEmail sql.NullString

		err := rows.Scan(
			&r.ID, &r.OrganizationID, &r.OrganizationName, &r.OrganizationTier,
			&r.StaffTemplateKey, &r.StaffTemplateTitle, &r.RequestedByEmail,
			&r.Status, &r.Justification, &r.ApprovalNotes, &approvedByEmail,
			&approvedAt, &r.CreatedAt, &r.UpdatedAt,
		)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if approvedAt.Valid {
			r.ApprovedAt = &approvedAt.Time
		}
		if approvedByEmail.Valid {
			r.ApprovedByEmail = approvedByEmail.String
		}

		requests = append(requests, r)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(requests)
}

// GetAvailableStaffTemplates returns staff templates available for organization tier
func (r *Router) GetAvailableStaffTemplates(w http.ResponseWriter, req *http.Request) {
	orgID := req.PathValue("org_id")

	// Get organization tier
	var tier string
	err := r.db.QueryRow(`
		SELECT oc.tier
		FROM organization_configurations oc
		WHERE oc.organization_id = $1
		LIMIT 1
	`, orgID).Scan(&tier)
	if err != nil {
		http.Error(w, "Organization not found", http.StatusNotFound)
		return
	}

	// Get all templates available for this tier
	rows, err := r.db.Query(`
		SELECT 
			st.template_key,
			st.title,
			st.role_group,
			st.category,
			st.api_role,
			st.description,
			st.sort_order,
			st.active,
			COALESCE(sta.min_staff_required, 0) as min_staff_required,
			$1 as tier
		FROM staff_role_templates st
		LEFT JOIN staff_template_tier_access sta ON st.template_key = sta.staff_template_key
		WHERE st.active = TRUE
		AND (sta.organization_tier = $1 OR sta.organization_tier IS NULL)
		ORDER BY st.sort_order
	`, tier)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var templates []StaffTemplateResponse
	for rows.Next() {
		var t StaffTemplateResponse
		err := rows.Scan(
			&t.TemplateKey, &t.Title, &t.RoleGroup, &t.Category, &t.APIRole,
			&t.Description, &t.SortOrder, &t.Active, &t.MinStaffRequired, &t.AvailableTier,
		)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		templates = append(templates, t)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(templates)
}

// ApproveStaffRequest approves a staff template request
func (r *Router) ApproveStaffRequest(w http.ResponseWriter, req *http.Request) {
	requestID := req.PathValue("request_id")

	// Check if user is super admin
	if !r.isUserSuperAdmin(req) {
		http.Error(w, "Unauthorized", http.StatusForbidden)
		return
	}

	var approval ApprovalRequest
	if err := json.NewDecoder(req.Body).Decode(&approval); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if approval.Status != "approved" && approval.Status != "rejected" {
		http.Error(w, "Invalid status", http.StatusBadRequest)
		return
	}

	userID := r.getUserIDFromContext(req)

	// Update request
	_, err := r.db.Exec(`
		UPDATE organization_staff_template_requests
		SET status = $1,
			approved_by = $2,
			approval_notes = $3,
			approved_at = CASE WHEN $1 = 'approved' THEN NOW() ELSE approved_at END,
			updated_at = NOW()
		WHERE id = $4
	`, approval.Status, userID, approval.ApprovalNotes, requestID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Log audit event
	r.logStaffAuditEvent(userID, requestID, approval.Status, approval.ApprovalNotes)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": fmt.Sprintf("Request %s", approval.Status)})
}

// RevokeStaffAccess revokes approved staff template access
func (r *Router) RevokeStaffAccess(w http.ResponseWriter, req *http.Request) {
	requestID := req.PathValue("request_id")

	// Check if user is super admin
	if !r.isUserSuperAdmin(req) {
		http.Error(w, "Unauthorized", http.StatusForbidden)
		return
	}

	var revocation ApprovalRequest
	if err := json.NewDecoder(req.Body).Decode(&revocation); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userID := r.getUserIDFromContext(req)

	// Update request to revoked
	_, err := r.db.Exec(`
		UPDATE organization_staff_template_requests
		SET status = 'revoked',
			approval_notes = $1,
			updated_at = NOW()
		WHERE id = $2 AND status = 'approved'
	`, revocation.Reason, requestID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Log audit event
	r.logStaffAuditEvent(userID, requestID, "revoked", revocation.Reason)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Access revoked"})
}

// GetStaffComplianceReport returns compliance status for organization
func (r *Router) GetStaffComplianceReport(w http.ResponseWriter, req *http.Request) {
	orgID := req.PathValue("org_id")

	// Check authorization
	if !r.isOrgAdminOrSuperAdmin(req, orgID) {
		http.Error(w, "Unauthorized", http.StatusForbidden)
		return
	}

	var report StaffComplianceReport
	var tier string

	// Get org info
	err := r.db.QueryRow(`
		SELECT org.name, oc.tier
		FROM organizations org
		LEFT JOIN organization_configurations oc ON org.id = oc.organization_id
		WHERE org.id = $1
	`, orgID).Scan(&report.OrganizationName, &tier)

	if err != nil {
		http.Error(w, "Organization not found", http.StatusNotFound)
		return
	}

	report.OrganizationID = orgID
	report.OrganizationTier = tier
	report.LastCheckedAt = time.Now()

	// Count approved staff
	err = r.db.QueryRow(`
		SELECT COUNT(*)
		FROM organization_staff_template_requests
		WHERE organization_id = $1 AND status = 'approved'
	`, orgID).Scan(&report.TotalApprovedStaff)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get minimum required for tier
	rows, err := r.db.Query(`
		SELECT SUM(min_staff_required)
		FROM staff_template_tier_access
		WHERE organization_tier = $1
	`, tier)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Determine compliance status
	if report.TotalApprovedStaff >= report.MinimumRequired {
		report.ComplianceStatus = "compliant"
	} else if report.TotalApprovedStaff >= (report.MinimumRequired / 2) {
		report.ComplianceStatus = "at_risk"
	} else {
		report.ComplianceStatus = "non_compliant"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(report)
}

// RequestStaffTemplate allows org admin to request a new staff template
func (r *Router) RequestStaffTemplate(w http.ResponseWriter, req *http.Request) {
	orgID := req.PathValue("org_id")

	// Check authorization: org admin or higher
	if !r.isOrgAdminOrHigher(req, orgID) {
		http.Error(w, "Unauthorized", http.StatusForbidden)
		return
	}

	var body struct {
		StaffTemplateKey string `json:"staff_template_key"`
		Justification    string `json:"justification"`
	}

	if err := json.NewDecoder(req.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userID := r.getUserIDFromContext(req)

	// Check if already exists
	var existing string
	err := r.db.QueryRow(`
		SELECT id FROM organization_staff_template_requests
		WHERE organization_id = $1 AND staff_template_key = $2
	`, orgID, body.StaffTemplateKey).Scan(&existing)

	if err == nil {
		http.Error(w, "Request already exists for this staff role", http.StatusConflict)
		return
	}

	// Validate tier before inserting
	var tier string
	err = r.db.QueryRow(`
		SELECT tier FROM organization_configurations WHERE organization_id = $1
	`, orgID).Scan(&tier)

	if err != nil {
		http.Error(w, "Organization configuration not found", http.StatusInternalServerError)
		return
	}

	// Check if tier allows this role
	var tierAccess int
	err = r.db.QueryRow(`
		SELECT COUNT(*) FROM staff_template_tier_access
		WHERE staff_template_key = $1 AND organization_tier = $2
	`, body.StaffTemplateKey, tier).Scan(&tierAccess)

	if err != nil || tierAccess == 0 {
		http.Error(w, fmt.Sprintf("Staff template '%s' not available for tier '%s'", body.StaffTemplateKey, tier), http.StatusForbidden)
		return
	}

	// Insert new request
	_, err = r.db.Exec(`
		INSERT INTO organization_staff_template_requests 
		(organization_id, staff_template_key, requested_by, justification, status)
		VALUES ($1, $2, $3, $4, 'pending')
	`, orgID, body.StaffTemplateKey, userID, body.Justification)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Staff request submitted"})
}

// Helper functions

func (r *Router) isUserSuperAdmin(req *http.Request) bool {
	userID := r.getUserIDFromContext(req)
	if userID == "" {
		return false
	}

	var isSuperAdmin bool
	err := r.db.QueryRow(`
		SELECT EXISTS(
			SELECT 1 FROM user_roles ur
			JOIN roles role ON ur.role_id = role.id
			WHERE ur.user_id = $1 AND role.name = 'superadmin'
		)
	`, userID).Scan(&isSuperAdmin)

	return err == nil && isSuperAdmin
}

func (r *Router) isOrgAdminOrSuperAdmin(req *http.Request, orgID string) bool {
	userID := r.getUserIDFromContext(req)
	if userID == "" {
		return false
	}

	// Check super admin
	var isSuperAdmin bool
	r.db.QueryRow(`
		SELECT EXISTS(
			SELECT 1 FROM user_roles ur
			JOIN roles role ON ur.role_id = role.id
			WHERE ur.user_id = $1 AND role.name = 'superadmin'
		)
	`, userID).Scan(&isSuperAdmin)

	if isSuperAdmin {
		return true
	}

	// Check org admin
	var isOrgAdmin bool
	err := r.db.QueryRow(`
		SELECT EXISTS(
			SELECT 1 FROM user_roles ur
			JOIN roles role ON ur.role_id = role.id
			WHERE ur.user_id = $1 AND ur.organization_id = $2 AND role.name = 'admin'
		)
	`, userID, orgID).Scan(&isOrgAdmin)

	return err == nil && isOrgAdmin
}

func (r *Router) isOrgAdminOrHigher(req *http.Request, orgID string) bool {
	return r.isOrgAdminOrSuperAdmin(req, orgID)
}

func (r *Router) getUserIDFromContext(req *http.Request) string {
	// Extract from JWT or session
	// This is implementation-specific
	return req.Header.Get("X-User-ID")
}

func (r *Router) logStaffAuditEvent(userID, requestID, status, notes string) {
	// Log to audit table
	_, _ = r.db.Exec(`
		INSERT INTO staff_audit_log (user_id, request_id, action, notes, created_at)
		VALUES ($1, $2, $3, $4, NOW())
	`, userID, requestID, status, notes)
}
