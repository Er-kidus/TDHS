//go:build legacy_staff_api

package api

import (
	"time"
)

type StaffAssignmentRequest struct {
	UserID            string `json:"user_id"`
	Email             string `json:"email"`
	FullName          string `json:"full_name"`
	StaffTemplateKey  string `json:"staff_template_key"`
	ProfessionalTitle string `json:"professional_title"`
	LicenseNumber     string `json:"license_number"`
	Role              string `json:"role"`
	Active            *bool  `json:"active,omitempty"` // ✅ FIXED
}

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
