package handler

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/tenadam/api-gateway/internal/model"
	"github.com/tenadam/api-gateway/internal/repository"
	"github.com/tenadam/api-gateway/internal/service"
)

type submitOrgApplicationRequest struct {
	OrganizationName  string                         `json:"organization_name"`
	OrganizationSlug  string                         `json:"organization_slug"`
	ContactName       string                         `json:"contact_name"`
	ContactEmail      string                         `json:"contact_email"`
	ContactPhone      string                         `json:"contact_phone"`
	LicenseNumber     string                         `json:"license_number"`
	Location          service.OrgApplicationLocation `json:"location"`
	RequestedServices []string                       `json:"requested_services"`
	StaffTemplates    []string                       `json:"selected_staff_templates"`
}

type configureOrgApplicationServicesRequest struct {
	Services []string `json:"services"`
}

type setOrgApplicationStaffConfigurationRequest struct {
	StaffTemplates []string `json:"staff_templates"`
}

type requestOrgApplicationUpdateRequest struct {
	Services []string `json:"services"`
	Notes    string   `json:"notes"`
}

type resolveOrgApplicationUpdateRequest struct {
	Approve  bool     `json:"approve"`
	Services []string `json:"services"`
}

type setOrgApplicationDomainRequest struct {
	Domain string `json:"domain"`
}

func (h *Handler) OrgMe(w http.ResponseWriter, r *http.Request) {
	h.writeJSON(w, http.StatusOK, map[string]any{
		"id":              subjectID(r.Context()),
		"role":            roleName(r.Context()),
		"type":            tokenType(r.Context()),
		"email":           subjectEmail(r.Context()),
		"organization_id": subjectOrgID(r.Context()),
	})
}

type updateMyTelemedicineRequest struct {
	TelemedicineEnabled   *bool          `json:"telemedicine_enabled"`
	TelemedicineSpecialty *string        `json:"telemedicine_specialty"`
	TelemedicineRate      *float64       `json:"telemedicine_rate"`
	TelemedicineCurrency  *string        `json:"telemedicine_currency"`
	TelemedicineModes     *[]string      `json:"telemedicine_modes"`
	SubSpecialty          *string        `json:"sub_specialty"`
	YearsExperience       *int           `json:"years_experience"`
	LanguagesSpoken       *[]string      `json:"languages_spoken"`
	OnlineStatus          *string        `json:"online_status"`
	SessionCapacity       *int           `json:"session_capacity"`
	Certifications        *[]string      `json:"certifications"`
	AreasOfExpertise      *[]string      `json:"areas_of_expertise"`
	EmergencySupport      *bool          `json:"emergency_support"`
	AvailabilitySchedule  map[string]any `json:"availability_schedule"`
	ProfileCompleteness   *int           `json:"profile_completeness"`
}

func (h *Handler) OrgGetMyTelemedicineProfile(w http.ResponseWriter, r *http.Request) {
	userID := strings.TrimSpace(subjectID(r.Context()))
	organizationID := strings.TrimSpace(subjectOrgID(r.Context()))
	if userID == "" || organizationID == "" {
		h.errorJSON(w, http.StatusBadRequest, "missing authenticated organization context")
		return
	}

	items, err := h.svcs.PatientPortal.ListOrganizationStaff(r.Context(), organizationID, 500)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to load telemedicine profile")
		return
	}

	for _, item := range items {
		if id, ok := item["id"].(string); ok && id == userID {
			profile := map[string]any{
				"id":                     item["id"],
				"full_name":              item["full_name"],
				"email":                  item["email"],
				"role":                   item["role"],
				"telemedicine_enabled":   item["telemedicine_enabled"],
				"telemedicine_specialty": item["telemedicine_specialty"],
				"telemedicine_rate":      item["telemedicine_rate"],
				"telemedicine_currency":  item["telemedicine_currency"],
				"telemedicine_modes":     item["telemedicine_modes"],
				"sub_specialty":          item["sub_specialty"],
				"years_experience":       item["years_experience"],
				"languages_spoken":       item["languages_spoken"],
				"online_status":          item["online_status"],
				"session_capacity":       item["session_capacity"],
				"certifications":         item["certifications"],
				"areas_of_expertise":     item["areas_of_expertise"],
				"emergency_support":      item["emergency_support"],
				"availability_schedule":  item["availability_schedule"],
				"profile_completeness":   item["profile_completeness"],
			}
			h.writeJSON(w, http.StatusOK, profile)
			return
		}
	}

	h.errorJSON(w, http.StatusNotFound, "staff profile not found")
}

func (h *Handler) OrgUpdateMyTelemedicineProfile(w http.ResponseWriter, r *http.Request) {
	userID := strings.TrimSpace(subjectID(r.Context()))
	organizationID := strings.TrimSpace(subjectOrgID(r.Context()))
	if userID == "" || organizationID == "" {
		h.errorJSON(w, http.StatusBadRequest, "missing authenticated organization context")
		return
	}

	var req updateMyTelemedicineRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	if req.TelemedicineSpecialty != nil {
		value := strings.TrimSpace(*req.TelemedicineSpecialty)
		req.TelemedicineSpecialty = &value
	}
	if req.TelemedicineCurrency != nil {
		value := strings.TrimSpace(strings.ToUpper(*req.TelemedicineCurrency))
		req.TelemedicineCurrency = &value
	}
	if req.TelemedicineModes != nil {
		normalized := normalizeTelemedicineModes(*req.TelemedicineModes)
		req.TelemedicineModes = &normalized
	}


	item, err := h.svcs.PatientPortal.UpdateOrganizationStaffTelemedicineProfile(
		r.Context(),
		organizationID,
		userID,
		model.TelemedicineProfileUpdate{
			TelemedicineEnabled:   req.TelemedicineEnabled,
			TelemedicineSpecialty: req.TelemedicineSpecialty,
			TelemedicineRate:      req.TelemedicineRate,
			TelemedicineCurrency:  req.TelemedicineCurrency,
			TelemedicineModes:     req.TelemedicineModes,
			SubSpecialty:          req.SubSpecialty,
			YearsExperience:       req.YearsExperience,
			LanguagesSpoken:       req.LanguagesSpoken,
			OnlineStatus:          req.OnlineStatus,
			SessionCapacity:       req.SessionCapacity,
			Certifications:        req.Certifications,
			AreasOfExpertise:      req.AreasOfExpertise,
			EmergencySupport:      req.EmergencySupport,
			AvailabilitySchedule:  req.AvailabilitySchedule,
			ProfileCompleteness:   req.ProfileCompleteness,
		},
	)
	if err != nil {
		if err == repository.ErrNotFound {
			h.errorJSON(w, http.StatusNotFound, "staff profile not found")
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to update telemedicine profile")
		return
	}

	profile := map[string]any{
		"id":                     item["id"],
		"full_name":              item["full_name"],
		"email":                  item["email"],
		"role":                   item["role"],
		"telemedicine_enabled":   item["telemedicine_enabled"],
		"telemedicine_specialty": item["telemedicine_specialty"],
		"telemedicine_rate":      item["telemedicine_rate"],
		"telemedicine_currency":  item["telemedicine_currency"],
		"telemedicine_modes":     item["telemedicine_modes"],
		"sub_specialty":          item["sub_specialty"],
		"years_experience":       item["years_experience"],
		"languages_spoken":       item["languages_spoken"],
		"online_status":          item["online_status"],
		"session_capacity":       item["session_capacity"],
		"certifications":         item["certifications"],
		"areas_of_expertise":     item["areas_of_expertise"],
		"emergency_support":      item["emergency_support"],
		"availability_schedule":  item["availability_schedule"],
		"profile_completeness":   item["profile_completeness"],
	}
	h.writeJSON(w, http.StatusOK, profile)
}

func (h *Handler) OrgMyApplication(w http.ResponseWriter, r *http.Request) {
	var (
		item *service.OrgApplication
		err  error
	)

	if orgID := subjectOrgID(r.Context()); orgID != "" {
		item, err = h.svcs.OrgApplications.GetByOrganizationID(orgID)
	}
	if item == nil && (err != nil || subjectOrgID(r.Context()) == "") {
		item, err = h.svcs.OrgApplications.GetByContactEmail(subjectEmail(r.Context()))
	}
	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "application not found") {
			h.writeJSON(w, http.StatusOK, nil)
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to load application")
		return
	}
	if item == nil {
		h.writeJSON(w, http.StatusOK, nil)
		return
	}

	response := map[string]any{
		"id":                        item.ID,
		"organization_name":         item.OrganizationName,
		"organization_slug":         item.OrganizationSlug,
		"organization_domain":       item.OrganizationDomain,
		"contact_name":              item.ContactName,
		"contact_email":             item.ContactEmail,
		"contact_phone":             item.ContactPhone,
		"license_number":            item.LicenseNumber,
		"location":                  item.Location,
		"requested_services":        item.RequestedServices,
		"configured_services":       item.ConfiguredServices,
		"selected_staff_templates":  item.SelectedStaffTemplates,
		"update_requested_services": item.UpdateRequestedServices,
		"update_request_notes":      item.UpdateRequestNotes,
		"update_request_status":     item.UpdateRequestStatus,
		"last_update_request_at":    item.LastUpdateRequestAt,
		"domain_configured_at":      item.DomainConfiguredAt,
		"status":                    item.Status,
		"approved_by":               item.ApprovedBy,
		"verified_at":               item.VerifiedAt,
		"created_at":                item.CreatedAt,
		"updated_at":                item.UpdatedAt,
	}
	if item.Status == service.OrgApplicationApproved || item.Status == service.OrgApplicationVerified {
		adminEmail, adminPassword := service.DefaultOrgPortalAdminCredentials(item.OrganizationSlug)
		response["portal_admin_email"] = adminEmail
		response["portal_admin_password"] = adminPassword
	}

	h.writeJSON(w, http.StatusOK, response)
}

func (h *Handler) OrgSubmitApplication(w http.ResponseWriter, r *http.Request) {
	var req submitOrgApplicationRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	if email := subjectEmail(r.Context()); email != "" {
		req.ContactEmail = email
	}

	item, err := h.svcs.OrgApplications.Submit(service.SubmitOrgApplicationInput{
		OrganizationName:  req.OrganizationName,
		OrganizationSlug:  req.OrganizationSlug,
		ContactName:       req.ContactName,
		ContactEmail:      req.ContactEmail,
		ContactPhone:      req.ContactPhone,
		LicenseNumber:     req.LicenseNumber,
		Location:          req.Location,
		RequestedServices: req.RequestedServices,
		StaffTemplates:    req.StaffTemplates,
	})
	if err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	h.writeJSON(w, http.StatusCreated, item)
}

func (h *Handler) OrgListRegisteredHospitals(w http.ResponseWriter, r *http.Request) {
	items, err := h.svcs.OrgApplications.ListRegisteredHospitals()
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list registered hospitals")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) OrgListApplications(w http.ResponseWriter, r *http.Request) {
	items, err := h.svcs.OrgApplications.List()
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list applications")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) OrgListStaffRoleTemplates(w http.ResponseWriter, r *http.Request) {
	templates, err := h.svcs.OrgApplications.ListStaffRoleTemplates()
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list staff templates")
		return
	}
	if templates == nil {
		templates = []*service.OrgStaffRoleTemplate{}
	}
	h.writeJSON(w, http.StatusOK, templates)
}

type createStaffRoleTemplateRequest struct {
	TemplateKey string `json:"template_key"`
	Title       string `json:"title"`
	RoleGroup   string `json:"role_group"`
	Category    string `json:"category"`
	ApiRole     string `json:"api_role"`
	Description string `json:"description"`
	SortOrder   int    `json:"sort_order"`
}

func (h *Handler) OrgCreateStaffRoleTemplate(w http.ResponseWriter, r *http.Request) {
	var req createStaffRoleTemplateRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	item, err := h.svcs.OrgApplications.CreateStaffRoleTemplate(service.OrgStaffRoleTemplate{
		TemplateKey: strings.TrimSpace(req.TemplateKey),
		Title:       strings.TrimSpace(req.Title),
		RoleGroup:   strings.TrimSpace(req.RoleGroup),
		Category:    strings.TrimSpace(req.Category),
		ApiRole:     strings.TrimSpace(strings.ToLower(req.ApiRole)),
		Description: strings.TrimSpace(req.Description),
		SortOrder:   req.SortOrder,
		Active:      true,
	})
	if err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	h.writeJSON(w, http.StatusCreated, item)
}

type updateStaffRoleTemplateRequest struct {
	Title       string `json:"title"`
	RoleGroup   string `json:"role_group"`
	Category    string `json:"category"`
	ApiRole     string `json:"api_role"`
	Description string `json:"description"`
	SortOrder   int    `json:"sort_order"`
	Active      *bool  `json:"active"`
}

func (h *Handler) OrgUpdateStaffRoleTemplate(w http.ResponseWriter, r *http.Request) {
	key := strings.TrimSpace(r.PathValue("key"))
	if key == "" {
		h.errorJSON(w, http.StatusBadRequest, "template key is required")
		return
	}

	var req updateStaffRoleTemplateRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	active := true
	if req.Active != nil {
		active = *req.Active
	}

	item, err := h.svcs.OrgApplications.UpdateStaffRoleTemplate(key, service.OrgStaffRoleTemplate{
		TemplateKey: key,
		Title:       strings.TrimSpace(req.Title),
		RoleGroup:   strings.TrimSpace(req.RoleGroup),
		Category:    strings.TrimSpace(req.Category),
		ApiRole:     strings.TrimSpace(strings.ToLower(req.ApiRole)),
		Description: strings.TrimSpace(req.Description),
		SortOrder:   req.SortOrder,
		Active:      active,
	})
	if err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	h.writeJSON(w, http.StatusOK, item)
}

type setStaffRoleTemplateStatusRequest struct {
	Active bool `json:"active"`
}

func (h *Handler) OrgSetStaffRoleTemplateStatus(w http.ResponseWriter, r *http.Request) {
	key := strings.TrimSpace(r.PathValue("key"))
	if key == "" {
		h.errorJSON(w, http.StatusBadRequest, "template key is required")
		return
	}

	var req setStaffRoleTemplateStatusRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	item, err := h.svcs.OrgApplications.SetStaffRoleTemplateStatus(key, req.Active)
	if err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	h.writeJSON(w, http.StatusOK, item)
}

func (h *Handler) OrgGetApplication(w http.ResponseWriter, r *http.Request) {
	item, err := h.svcs.OrgApplications.Get(strings.TrimSpace(r.PathValue("id")))
	if err != nil {
		h.errorJSON(w, http.StatusNotFound, "application not found")
		return
	}
	h.writeJSON(w, http.StatusOK, item)
}

func (h *Handler) OrgApproveApplication(w http.ResponseWriter, r *http.Request) {
	item, err := h.svcs.OrgApplications.Approve(strings.TrimSpace(r.PathValue("id")), roleName(r.Context()))
	if err != nil {
		h.errorJSON(w, http.StatusNotFound, "application not found")
		return
	}
	h.writeJSON(w, http.StatusOK, item)
}

func (h *Handler) OrgRejectApplication(w http.ResponseWriter, r *http.Request) {
	item, err := h.svcs.OrgApplications.Reject(strings.TrimSpace(r.PathValue("id")), roleName(r.Context()))
	if err != nil {
		h.errorJSON(w, http.StatusNotFound, "application not found")
		return
	}
	h.writeJSON(w, http.StatusOK, item)
}

func (h *Handler) OrgConfigureApplicationServices(w http.ResponseWriter, r *http.Request) {
	var req configureOrgApplicationServicesRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	item, err := h.svcs.OrgApplications.ConfigureServices(strings.TrimSpace(r.PathValue("id")), req.Services)
	if err != nil {
		h.errorJSON(w, http.StatusNotFound, "application not found")
		return
	}
	h.writeJSON(w, http.StatusOK, item)
}

func (h *Handler) OrgSetApplicationStaffConfiguration(w http.ResponseWriter, r *http.Request) {
	var req setOrgApplicationStaffConfigurationRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	item, err := h.svcs.OrgApplications.SetStaffTemplates(strings.TrimSpace(r.PathValue("id")), req.StaffTemplates)
	if err != nil {
		h.errorJSON(w, http.StatusNotFound, "application not found")
		return
	}
	h.writeJSON(w, http.StatusOK, item)
}

func (h *Handler) OrgRequestApplicationUpdate(w http.ResponseWriter, r *http.Request) {
	var req requestOrgApplicationUpdateRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	item, err := h.svcs.OrgApplications.RequestServiceUpdate(strings.TrimSpace(r.PathValue("id")), req.Services, req.Notes)
	if err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	h.writeJSON(w, http.StatusOK, item)
}

func (h *Handler) OrgResolveApplicationUpdate(w http.ResponseWriter, r *http.Request) {
	var req resolveOrgApplicationUpdateRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	item, err := h.svcs.OrgApplications.ResolveServiceUpdate(strings.TrimSpace(r.PathValue("id")), req.Approve, req.Services)
	if err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	h.writeJSON(w, http.StatusOK, item)
}

func (h *Handler) OrgSetApplicationDomain(w http.ResponseWriter, r *http.Request) {
	var req setOrgApplicationDomainRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	item, err := h.svcs.OrgApplications.SetOrganizationDomain(strings.TrimSpace(r.PathValue("id")), req.Domain)
	if err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	h.writeJSON(w, http.StatusOK, item)
}

func (h *Handler) OrgListPatients(w http.ResponseWriter, r *http.Request) {
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if strings.EqualFold(roleName(r.Context()), "superadmin") {
		items, err := h.svcs.Patients.List(r.Context(), limit)
		if err != nil {
			h.errorJSON(w, http.StatusInternalServerError, "failed to list patients")
			return
		}
		if items == nil {
			items = []*model.Patient{}
		}
		h.writeJSON(w, http.StatusOK, items)
		return
	}

	orgID := subjectOrgID(r.Context())
	if orgID == "" {
		h.errorJSON(w, http.StatusForbidden, "organization context is missing")
		return
	}

	items, err := h.svcs.Patients.ListByOrganization(r.Context(), orgID, limit)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list patients")
		return
	}
	if items == nil {
		items = []*model.Patient{}
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) OrgGetPatient(w http.ResponseWriter, r *http.Request) {
	orgID := subjectOrgID(r.Context())
	if orgID == "" {
		h.errorJSON(w, http.StatusForbidden, "organization context is missing")
		return
	}
	id := r.PathValue("id")
	patient, err := h.svcs.Patients.GetByIDForOrganization(r.Context(), id, orgID)
	if err != nil {
		if err == repository.ErrNotFound {
			h.errorJSON(w, http.StatusNotFound, "patient not found")
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to load patient")
		return
	}
	h.writeJSON(w, http.StatusOK, patient)
}

func (h *Handler) OrgListUsers(w http.ResponseWriter, r *http.Request) {
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	items, err := h.svcs.PatientPortal.ListOrgUsers(r.Context(), limit)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list users")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) OrgListOrganizations(w http.ResponseWriter, r *http.Request) {
	items, err := h.svcs.PatientPortal.ListOrganizations(r.Context())
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list organizations")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) OrgListOrganizationTiers(w http.ResponseWriter, r *http.Request) {
	items, err := h.svcs.PatientPortal.ListOrganizationTiers(r.Context())
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list organization tiers")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) OrgUpdateOrganizationTierDefaults(w http.ResponseWriter, r *http.Request) {
	tier := strings.TrimSpace(r.PathValue("tier"))
	if tier == "" {
		h.errorJSON(w, http.StatusBadRequest, "tier is required")
		return
	}

	var req struct {
		DefaultServices []string `json:"default_services"`
	}
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, "invalid request body")
		return
	}

	err := h.svcs.PatientPortal.UpdateTierDefaults(r.Context(), tier, req.DefaultServices)
	if err != nil {
		if err.Error() == "tier not found" {
			h.errorJSON(w, http.StatusNotFound, "tier not found")
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to update tier defaults")
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"message": "Tier defaults updated successfully",
	})
}

func (h *Handler) OrgListOrganizationsManaged(w http.ResponseWriter, r *http.Request) {
	search := strings.TrimSpace(r.URL.Query().Get("search"))
	items, err := h.svcs.PatientPortal.ListOrganizationsWithConfiguration(r.Context(), search)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list managed organizations")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) orgManagementAllowed(r *http.Request, targetOrganizationID string) bool {
	if strings.EqualFold(roleName(r.Context()), "superadmin") {
		return true
	}
	requestOrgID := strings.TrimSpace(subjectOrgID(r.Context()))
	target := strings.TrimSpace(targetOrganizationID)
	return requestOrgID != "" && target != "" && strings.EqualFold(requestOrgID, target)
}

func (h *Handler) logOrganizationStaffAudit(r *http.Request, action, organizationID, targetUserID string) {
	actorID := subjectID(r.Context())
	actorEmail := subjectEmail(r.Context())
	actorRole := strings.ToLower(strings.TrimSpace(roleName(r.Context())))
	actorOrgID := subjectOrgID(r.Context())

	if err := h.svcs.PatientPortal.InsertOrganizationStaffAuditLog(
		r.Context(),
		action,
		actorID,
		actorEmail,
		actorRole,
		actorOrgID,
		organizationID,
		targetUserID,
	); err != nil {
		log.Printf("audit_event=org_staff_%s persistence=failed error=%v", action, err)
	}

	log.Printf(
		"audit_event=org_staff_%s actor_id=%s actor_email=%s actor_role=%s actor_org_id=%s target_org_id=%s target_user_id=%s",
		action,
		actorID,
		actorEmail,
		actorRole,
		actorOrgID,
		organizationID,
		targetUserID,
	)
}

func (h *Handler) OrgGetOrganizationConfiguration(w http.ResponseWriter, r *http.Request) {
	organizationID := strings.TrimSpace(r.PathValue("id"))
	if organizationID == "" {
		h.errorJSON(w, http.StatusBadRequest, "organization id is required")
		return
	}
	if !h.orgManagementAllowed(r, organizationID) {
		h.errorJSON(w, http.StatusForbidden, "forbidden")
		return
	}

	item, err := h.svcs.PatientPortal.GetOrganizationConfiguration(r.Context(), organizationID)
	if err != nil {
		if err == repository.ErrNotFound {
			h.errorJSON(w, http.StatusNotFound, "organization not found")
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to load organization configuration")
		return
	}
	h.writeJSON(w, http.StatusOK, item)
}

func (h *Handler) OrgGetMyOrganizationConfiguration(w http.ResponseWriter, r *http.Request) {
	organizationID := strings.TrimSpace(subjectOrgID(r.Context()))
	if organizationID == "" {
		resolvedOrgID, err := h.svcs.OrgApplications.GetOrganizationIDByContactEmail(subjectEmail(r.Context()))
		if err == nil {
			organizationID = strings.TrimSpace(resolvedOrgID)
		}
	}
	if organizationID == "" {
		h.errorJSON(w, http.StatusNotFound, "organization context is missing")
		return
	}

	item, err := h.svcs.PatientPortal.GetOrganizationConfiguration(r.Context(), organizationID)
	if err != nil {
		if err == repository.ErrNotFound {
			h.errorJSON(w, http.StatusNotFound, "organization not found")
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to load organization configuration")
		return
	}

	h.writeJSON(w, http.StatusOK, item)
}

type upsertOrganizationConfigurationRequest struct {
	Tier            string         `json:"tier"`
	EnabledServices []string       `json:"enabled_services"`
	MinStaff        map[string]int `json:"min_staff"`
	QueueEnabled    *bool          `json:"queue_enabled"`
	FeatureFlags    map[string]any `json:"feature_flags"`
	WorkflowRules   map[string]any `json:"workflow_rules"`
	Communication   map[string]any `json:"communication"`
	Billing         map[string]any `json:"billing"`
}

type upsertOrganizationServiceManagementRequest struct {
	Tier              string   `json:"tier"`
	InstalledServices []string `json:"installed_services"`
}

func (h *Handler) OrgUpsertOrganizationConfiguration(w http.ResponseWriter, r *http.Request) {
	organizationID := strings.TrimSpace(r.PathValue("id"))
	if organizationID == "" {
		h.errorJSON(w, http.StatusBadRequest, "organization id is required")
		return
	}
	if !strings.EqualFold(roleName(r.Context()), "superadmin") {
		h.errorJSON(w, http.StatusForbidden, "only superadmin can update organization configuration")
		return
	}
	if !h.orgManagementAllowed(r, organizationID) {
		h.errorJSON(w, http.StatusForbidden, "forbidden")
		return
	}

	var req upsertOrganizationConfigurationRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	queueEnabled := true
	if req.QueueEnabled != nil {
		queueEnabled = *req.QueueEnabled
	}
	item, err := h.svcs.PatientPortal.UpsertOrganizationConfiguration(
		r.Context(),
		organizationID,
		strings.TrimSpace(strings.ToLower(req.Tier)),
		req.EnabledServices,
		req.MinStaff,
		queueEnabled,
		req.FeatureFlags,
		req.WorkflowRules,
		req.Communication,
		req.Billing,
	)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to save organization configuration")
		return
	}
	h.writeJSON(w, http.StatusOK, item)
}

func (h *Handler) OrgGetOrganizationServiceManagement(w http.ResponseWriter, r *http.Request) {
	organizationID := strings.TrimSpace(r.PathValue("id"))
	if organizationID == "" {
		h.errorJSON(w, http.StatusBadRequest, "organization id is required")
		return
	}
	if !h.orgManagementAllowed(r, organizationID) {
		h.errorJSON(w, http.StatusForbidden, "forbidden")
		return
	}

	item, err := h.svcs.PatientPortal.GetOrganizationServiceManagementConfiguration(r.Context(), organizationID)
	if err != nil {
		if err == repository.ErrNotFound {
			h.errorJSON(w, http.StatusNotFound, "organization not found")
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to load service management configuration")
		return
	}
	h.writeJSON(w, http.StatusOK, item)
}

func (h *Handler) OrgGetMyServiceManagement(w http.ResponseWriter, r *http.Request) {
	organizationID := strings.TrimSpace(subjectOrgID(r.Context()))
	if organizationID == "" {
		resolvedOrgID, err := h.svcs.OrgApplications.GetOrganizationIDByContactEmail(subjectEmail(r.Context()))
		if err == nil {
			organizationID = strings.TrimSpace(resolvedOrgID)
		}
	}
	if organizationID == "" {
		h.errorJSON(w, http.StatusNotFound, "organization context is missing")
		return
	}

	item, err := h.svcs.PatientPortal.GetOrganizationServiceManagementConfiguration(r.Context(), organizationID)
	if err != nil {
		if err == repository.ErrNotFound {
			h.errorJSON(w, http.StatusNotFound, "organization not found")
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to load service management configuration")
		return
	}

	h.writeJSON(w, http.StatusOK, item)
}

func (h *Handler) OrgUpsertOrganizationServiceManagement(w http.ResponseWriter, r *http.Request) {
	organizationID := strings.TrimSpace(r.PathValue("id"))
	if organizationID == "" {
		h.errorJSON(w, http.StatusBadRequest, "organization id is required")
		return
	}
	if !strings.EqualFold(roleName(r.Context()), "superadmin") {
		h.errorJSON(w, http.StatusForbidden, "only superadmin can update service management configuration")
		return
	}
	if !h.orgManagementAllowed(r, organizationID) {
		h.errorJSON(w, http.StatusForbidden, "forbidden")
		return
	}

	var req upsertOrganizationServiceManagementRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	item, err := h.svcs.PatientPortal.UpsertOrganizationServiceManagementConfiguration(
		r.Context(),
		organizationID,
		strings.TrimSpace(strings.ToLower(req.Tier)),
		req.InstalledServices,
		subjectID(r.Context()),
	)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to save service management configuration")
		return
	}
	h.writeJSON(w, http.StatusOK, item)
}

func (h *Handler) OrgListOrganizationStaff(w http.ResponseWriter, r *http.Request) {
	organizationID := strings.TrimSpace(r.PathValue("id"))
	if organizationID == "" {
		h.errorJSON(w, http.StatusBadRequest, "organization id is required")
		return
	}
	if !h.orgManagementAllowed(r, organizationID) {
		h.errorJSON(w, http.StatusForbidden, "forbidden")
		return
	}
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	items, err := h.svcs.PatientPortal.ListOrganizationStaff(r.Context(), organizationID, limit)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list organization staff")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

type createOrganizationStaffRequest struct {
	FullName              string   `json:"full_name"`
	Email                 string   `json:"email"`
	Password              string   `json:"password"`
	Role                  string   `json:"role"`
	StaffTemplateKey      string   `json:"staff_template_key"`
	ProfessionalTitle     string   `json:"professional_title"`
	LicenseNumber         string   `json:"license_number"`
	TelemedicineEnabled   *bool    `json:"telemedicine_enabled"`
	TelemedicineSpecialty string   `json:"telemedicine_specialty"`
	TelemedicineRate      float64  `json:"telemedicine_rate"`
	TelemedicineCurrency  string   `json:"telemedicine_currency"`
	TelemedicineModes     []string `json:"telemedicine_modes"`
}

func (h *Handler) OrgCreateOrganizationStaff(w http.ResponseWriter, r *http.Request) {
	organizationID := strings.TrimSpace(r.PathValue("id"))
	if organizationID == "" {
		h.errorJSON(w, http.StatusBadRequest, "organization id is required")
		return
	}
	if !h.orgManagementAllowed(r, organizationID) {
		h.errorJSON(w, http.StatusForbidden, "forbidden")
		return
	}

	var req createOrganizationStaffRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	req.Role = strings.TrimSpace(strings.ToLower(req.Role))
	if req.FullName == "" || req.Email == "" || req.Password == "" || req.Role == "" {
		h.errorJSON(w, http.StatusBadRequest, "full_name, email, password, and role are required")
		return
	}
	if req.Role != "admin" && req.Role != "doctor" && req.Role != "nurse" && req.Role != "staff" && req.Role != "reception" && req.Role != "pharmacist" && req.Role != "lab" {
		h.errorJSON(w, http.StatusBadRequest, "unsupported role")
		return
	}

	telemedicineEnabled := false
	if req.TelemedicineEnabled != nil {
		telemedicineEnabled = *req.TelemedicineEnabled
	} else if req.Role == "doctor" || req.Role == "nurse" {
		telemedicineEnabled = true
	}
	telemedicineModes := normalizeTelemedicineModes(req.TelemedicineModes)

	item, err := h.svcs.PatientPortal.CreateOrganizationStaff(
		r.Context(),
		organizationID,
		strings.TrimSpace(req.FullName),
		strings.TrimSpace(strings.ToLower(req.Email)),
		strings.TrimSpace(req.Password),
		req.Role,
		strings.TrimSpace(req.StaffTemplateKey),
		strings.TrimSpace(req.ProfessionalTitle),
		strings.TrimSpace(req.LicenseNumber),
		telemedicineEnabled,
		strings.TrimSpace(req.TelemedicineSpecialty),
		req.TelemedicineRate,
		strings.TrimSpace(strings.ToUpper(req.TelemedicineCurrency)),
		telemedicineModes,
	)
	if err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	targetUserID := ""
	if id, ok := item["id"].(string); ok {
		targetUserID = id
	}
	h.logOrganizationStaffAudit(r, "create", organizationID, targetUserID)

	h.writeJSON(w, http.StatusCreated, item)
}

type updateOrganizationStaffRequest struct {
	FullName              *string   `json:"full_name"`
	Role                  *string   `json:"role"`
	StaffTemplateKey      *string   `json:"staff_template_key"`
	ProfessionalTitle     *string   `json:"professional_title"`
	LicenseNumber         *string   `json:"license_number"`
	Active                *bool     `json:"active"`
	TelemedicineEnabled   *bool     `json:"telemedicine_enabled"`
	TelemedicineSpecialty *string   `json:"telemedicine_specialty"`
	TelemedicineRate      *float64  `json:"telemedicine_rate"`
	TelemedicineCurrency  *string   `json:"telemedicine_currency"`
	TelemedicineModes     *[]string `json:"telemedicine_modes"`
}

func (h *Handler) OrgUpdateOrganizationStaff(w http.ResponseWriter, r *http.Request) {
	organizationID := strings.TrimSpace(r.PathValue("id"))
	if organizationID == "" {
		h.errorJSON(w, http.StatusBadRequest, "organization id is required")
		return
	}
	if !h.orgManagementAllowed(r, organizationID) {
		h.errorJSON(w, http.StatusForbidden, "forbidden")
		return
	}

	userID := strings.TrimSpace(r.PathValue("userId"))
	if userID == "" {
		h.errorJSON(w, http.StatusBadRequest, "user id is required")
		return
	}

	var req updateOrganizationStaffRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	if req.FullName == nil && req.Role == nil && req.StaffTemplateKey == nil && req.ProfessionalTitle == nil && req.LicenseNumber == nil && req.Active == nil && req.TelemedicineEnabled == nil && req.TelemedicineSpecialty == nil && req.TelemedicineRate == nil && req.TelemedicineCurrency == nil && req.TelemedicineModes == nil {
		h.errorJSON(w, http.StatusBadRequest, "at least one staff field is required")
		return
	}
	if req.FullName != nil {
		value := strings.TrimSpace(*req.FullName)
		req.FullName = &value
	}
	if req.Role != nil {
		value := strings.TrimSpace(strings.ToLower(*req.Role))
		req.Role = &value
	}
	if req.StaffTemplateKey != nil {
		value := strings.TrimSpace(*req.StaffTemplateKey)
		req.StaffTemplateKey = &value
	}
	if req.ProfessionalTitle != nil {
		value := strings.TrimSpace(*req.ProfessionalTitle)
		req.ProfessionalTitle = &value
	}
	if req.LicenseNumber != nil {
		value := strings.TrimSpace(*req.LicenseNumber)
		req.LicenseNumber = &value
	}
	if req.TelemedicineSpecialty != nil {
		value := strings.TrimSpace(*req.TelemedicineSpecialty)
		req.TelemedicineSpecialty = &value
	}
	if req.TelemedicineCurrency != nil {
		value := strings.TrimSpace(strings.ToUpper(*req.TelemedicineCurrency))
		req.TelemedicineCurrency = &value
	}
	if req.TelemedicineModes != nil {
		normalized := normalizeTelemedicineModes(*req.TelemedicineModes)
		req.TelemedicineModes = &normalized
	}

	item, err := h.svcs.PatientPortal.UpdateOrganizationStaff(
		r.Context(),
		organizationID,
		userID,
		req.FullName,
		req.Role,
		req.StaffTemplateKey,
		req.ProfessionalTitle,
		req.LicenseNumber,
		req.Active,
		req.TelemedicineEnabled,
		req.TelemedicineSpecialty,
		req.TelemedicineRate,
		req.TelemedicineCurrency,
		req.TelemedicineModes,
	)
	if err != nil {
		if err == repository.ErrNotFound {
			h.errorJSON(w, http.StatusNotFound, "staff not found")
			return
		}
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	h.logOrganizationStaffAudit(r, "update", organizationID, userID)

	h.writeJSON(w, http.StatusOK, item)
}

func (h *Handler) OrgDeleteOrganizationStaff(w http.ResponseWriter, r *http.Request) {
	organizationID := strings.TrimSpace(r.PathValue("id"))
	if organizationID == "" {
		h.errorJSON(w, http.StatusBadRequest, "organization id is required")
		return
	}
	if !h.orgManagementAllowed(r, organizationID) {
		h.errorJSON(w, http.StatusForbidden, "forbidden")
		return
	}

	userID := strings.TrimSpace(r.PathValue("userId"))
	if userID == "" {
		h.errorJSON(w, http.StatusBadRequest, "user id is required")
		return
	}

	if err := h.svcs.PatientPortal.DeleteOrganizationStaff(r.Context(), organizationID, userID); err != nil {
		if err == repository.ErrNotFound {
			h.errorJSON(w, http.StatusNotFound, "staff not found")
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to delete organization staff")
		return
	}
	h.logOrganizationStaffAudit(r, "delete", organizationID, userID)

	h.writeJSON(w, http.StatusOK, map[string]any{"deleted": true, "id": userID})
}

func normalizeTelemedicineModes(input []string) []string {
	if len(input) == 0 {
		return []string{"video", "voice", "chat"}
	}
	seen := map[string]struct{}{}
	out := make([]string, 0, len(input))
	for _, raw := range input {
		mode := strings.ToLower(strings.TrimSpace(raw))
		if mode != "video" && mode != "voice" && mode != "chat" {
			continue
		}
		if _, exists := seen[mode]; exists {
			continue
		}
		seen[mode] = struct{}{}
		out = append(out, mode)
	}
	if len(out) == 0 {
		return []string{"video", "voice", "chat"}
	}
	return out
}

func (h *Handler) OrgListTelemedicineQueue(w http.ResponseWriter, r *http.Request) {
	organizationID := strings.TrimSpace(r.URL.Query().Get("organization_id"))
	if organizationID == "" {
		organizationID = strings.TrimSpace(subjectOrgID(r.Context()))
	}
	if organizationID == "" {
		h.errorJSON(w, http.StatusBadRequest, "organization_id is required")
		return
	}
	if !h.orgManagementAllowed(r, organizationID) {
		h.errorJSON(w, http.StatusForbidden, "forbidden")
		return
	}
	items, err := h.svcs.PatientPortal.ListTelemedicineQueueByOrganization(r.Context(), organizationID, parseLimit(r, 50))
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list telemedicine queue")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

type acceptTelemedicineSessionRequest struct {
	SessionID string `json:"session_id"`
	DoctorID  string `json:"doctor_id"`
}

func (h *Handler) OrgAcceptTelemedicineSession(w http.ResponseWriter, r *http.Request) {
	organizationID := strings.TrimSpace(r.URL.Query().Get("organization_id"))
	if organizationID == "" {
		organizationID = strings.TrimSpace(subjectOrgID(r.Context()))
	}
	if organizationID == "" {
		h.errorJSON(w, http.StatusBadRequest, "organization_id is required")
		return
	}
	if !h.orgManagementAllowed(r, organizationID) {
		h.errorJSON(w, http.StatusForbidden, "forbidden")
		return
	}

	var req acceptTelemedicineSessionRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	req.SessionID = strings.TrimSpace(req.SessionID)
	req.DoctorID = strings.TrimSpace(req.DoctorID)
	if req.SessionID == "" {
		h.errorJSON(w, http.StatusBadRequest, "session_id is required")
		return
	}
	if req.DoctorID == "" {
		req.DoctorID = subjectID(r.Context())
	}
	item, err := h.svcs.PatientPortal.AcceptTelemedicineSession(r.Context(), organizationID, req.SessionID, req.DoctorID)
	if err != nil {
		if err == repository.ErrNotFound {
			h.errorJSON(w, http.StatusNotFound, "session not found or not pending")
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to accept telemedicine session")
		return
	}
	h.writeJSON(w, http.StatusOK, item)
}

type createOrgUserRequest struct {
	FullName string `json:"full_name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

func (h *Handler) OrgCreateUser(w http.ResponseWriter, r *http.Request) {
	var req createOrgUserRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	req.Role = strings.ToLower(strings.TrimSpace(req.Role))
	if req.FullName == "" || req.Email == "" || req.Password == "" || req.Role == "" {
		h.errorJSON(w, http.StatusBadRequest, "full_name, email, password, and role are required")
		return
	}
	if req.Role != "admin" && req.Role != "doctor" && req.Role != "nurse" && req.Role != "staff" {
		h.errorJSON(w, http.StatusBadRequest, "role must be one of admin, doctor, nurse, staff")
		return
	}
	item, err := h.svcs.PatientPortal.CreateOrgUser(r.Context(), req.FullName, req.Email, req.Password, req.Role)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to create user")
		return
	}
	h.writeJSON(w, http.StatusCreated, item)
}

type updateOrgUserRequest struct {
	FullName *string `json:"full_name"`
	Email    *string `json:"email"`
}

func (h *Handler) OrgUpdateUser(w http.ResponseWriter, r *http.Request) {
	userID := strings.TrimSpace(r.PathValue("id"))
	if userID == "" {
		h.errorJSON(w, http.StatusBadRequest, "user id is required")
		return
	}

	var req updateOrgUserRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	if req.FullName == nil && req.Email == nil {
		h.errorJSON(w, http.StatusBadRequest, "full_name or email is required")
		return
	}

	item, err := h.svcs.PatientPortal.UpdateOrgUser(r.Context(), userID, req.FullName, req.Email)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to update user")
		return
	}
	h.writeJSON(w, http.StatusOK, item)
}

type setOrgUserRoleRequest struct {
	Role string `json:"role"`
}

func (h *Handler) OrgSetUserRole(w http.ResponseWriter, r *http.Request) {
	userID := strings.TrimSpace(r.PathValue("id"))
	if userID == "" {
		h.errorJSON(w, http.StatusBadRequest, "user id is required")
		return
	}

	var req setOrgUserRoleRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	req.Role = strings.ToLower(strings.TrimSpace(req.Role))
	if req.Role != "admin" && req.Role != "doctor" && req.Role != "nurse" && req.Role != "staff" {
		h.errorJSON(w, http.StatusBadRequest, "role must be one of admin, doctor, nurse, staff")
		return
	}

	item, err := h.svcs.PatientPortal.SetOrgUserRole(r.Context(), userID, req.Role)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to update user role")
		return
	}
	h.writeJSON(w, http.StatusOK, item)
}

type setOrgUserStatusRequest struct {
	Action string `json:"action"`
}

func (h *Handler) OrgSetUserStatus(w http.ResponseWriter, r *http.Request) {
	userID := strings.TrimSpace(r.PathValue("id"))
	if userID == "" {
		h.errorJSON(w, http.StatusBadRequest, "user id is required")
		return
	}

	var req setOrgUserStatusRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	action := strings.ToLower(strings.TrimSpace(req.Action))
	if action == "" {
		action = "lock"
	}

	active := false
	switch action {
	case "lock", "deactivate":
		active = false
	case "unlock", "activate":
		active = true
	default:
		h.errorJSON(w, http.StatusBadRequest, "action must be one of lock, unlock, deactivate, activate")
		return
	}

	item, err := h.svcs.PatientPortal.SetOrgUserActive(r.Context(), userID, active)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to update user status")
		return
	}
	h.writeJSON(w, http.StatusOK, item)
}

type resetOrgUserPasswordRequest struct {
	Password string `json:"password"`
}

func (h *Handler) OrgResetUserPassword(w http.ResponseWriter, r *http.Request) {
	userID := strings.TrimSpace(r.PathValue("id"))
	if userID == "" {
		h.errorJSON(w, http.StatusBadRequest, "user id is required")
		return
	}

	var req resetOrgUserPasswordRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	req.Password = strings.TrimSpace(req.Password)
	if req.Password == "" {
		req.Password = "Reset123!"
	}

	if err := h.svcs.PatientPortal.ResetOrgUserPassword(r.Context(), userID, req.Password); err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to reset password")
		return
	}
	h.writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (h *Handler) OrgSystemOverview(w http.ResponseWriter, r *http.Request) {
	item, err := h.svcs.PatientPortal.OrgSystemOverview(r.Context())
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to load system overview")
		return
	}
	h.writeJSON(w, http.StatusOK, item)
}

func (h *Handler) OrgListSystemRoles(w http.ResponseWriter, r *http.Request) {
	roles, err := h.svcs.OrgApplications.ListSystemRoles()
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to load system roles")
		return
	}
	h.writeJSON(w, http.StatusOK, roles)
}

func (h *Handler) OrgGetLicenses(w http.ResponseWriter, r *http.Request) {
	file, err := os.Open("assets/licenses.csv")
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to load licenses data")
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to parse licenses data")
		return
	}

	var licenses []map[string]string
	if len(records) > 0 {
		headers := records[0]
		for _, row := range records[1:] {
			license := make(map[string]string)
			for i, header := range headers {
				if i < len(row) {
					license[header] = row[i]
				}
			}
			licenses = append(licenses, license)
		}
	}

	h.writeJSON(w, http.StatusOK, licenses)
}

func (h *Handler) OrgSetNgrokConfig(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		PatientToken      string `json:"patient_token"`
		OrgToken          string `json:"org_token"`
		SuperadminToken   string `json:"superadmin_token"`
		RegistrationToken string `json:"registration_token"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		h.errorJSON(w, http.StatusBadRequest, "invalid request payload")
		return
	}

	envPath := "../../tools/admin-dashboard/.env.local"
	content := fmt.Sprintf("# Local-only admin dashboard secrets\nNGROK_AUTHTOKEN_PATIENT=%s\nNGROK_AUTHTOKEN_ORG=%s\nNGROK_AUTHTOKEN_SUPERADMIN=%s\nNGROK_AUTHTOKEN_REGISTRATION=%s\n", 
		payload.PatientToken, payload.OrgToken, payload.SuperadminToken, payload.RegistrationToken)

	if err := os.WriteFile(envPath, []byte(content), 0644); err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to save ngrok configuration")
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]string{"message": "Ngrok configuration saved"})
}

func (h *Handler) OrgGetAiConfig(w http.ResponseWriter, r *http.Request) {
	// Expose safe/masked versions or just keys for Super Admin to verify
	keys := map[string]string{
		"gemini":   os.Getenv("GEMINI_API_KEY"),
		"groq":     os.Getenv("GROQ_API_KEY"),
		"deepseek": os.Getenv("DEEPSEEK_API_KEY"),
	}
	h.writeJSON(w, http.StatusOK, keys)
}

func (h *Handler) OrgSetAiConfig(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Gemini   string `json:"gemini"`
		Groq     string `json:"groq"`
		Deepseek string `json:"deepseek"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		h.errorJSON(w, http.StatusBadRequest, "invalid request payload")
		return
	}

	// This is a mock implementation that doesn't persist the env globally because updating os env vars 
	// dynamically in a docker container only affects this process. In a real system, it would save to DB.
	os.Setenv("GEMINI_API_KEY", payload.Gemini)
	os.Setenv("GROQ_API_KEY", payload.Groq)
	os.Setenv("DEEPSEEK_API_KEY", payload.Deepseek)

	h.writeJSON(w, http.StatusOK, map[string]string{"message": "AI configuration updated temporarily"})
}

// ── Org: Pregnancy Care Management ─────────────────────────────────────────

func (h *Handler) OrgListPregnancyEpisodes(w http.ResponseWriter, r *http.Request) {
	orgID := subjectOrgID(r.Context())
	limit := parseLimit(r, 100)
	items, err := h.svcs.PatientPortal.OrgListPregnancyEpisodes(r.Context(), orgID, limit)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list pregnancy episodes")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) OrgCreatePregnancyEpisode(w http.ResponseWriter, r *http.Request) {
	var req struct {
		PatientID              string   `json:"patient_id"`
		AssignedProviderID     *string  `json:"assigned_provider_id"`
		LMP                    *string  `json:"lmp"`
		ExpectedDeliveryDate   *string  `json:"expected_delivery_date"`
		GestationalAgeWeeks    *int     `json:"gestational_age_weeks"`
		Trimester              int      `json:"trimester"`
		Gravidity              int      `json:"gravidity"`
		Parity                 int      `json:"parity"`
		HighRisk               bool     `json:"high_risk"`
		RiskFactors            []string `json:"risk_factors"`
		ExistingConditions     []string `json:"existing_conditions"`
		Notes                  string   `json:"notes"`
		SeverityLevel          string   `json:"severity_level"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.PatientID == "" {
		h.errorJSON(w, http.StatusBadRequest, "patient_id is required")
		return
	}
	if req.Trimester < 1 || req.Trimester > 3 {
		req.Trimester = 1
	}
	if req.SeverityLevel == "" {
		req.SeverityLevel = "green"
	}
	if req.Gravidity < 1 {
		req.Gravidity = 1
	}
	if req.RiskFactors == nil {
		req.RiskFactors = []string{}
	}
	if req.ExistingConditions == nil {
		req.ExistingConditions = []string{}
	}

	orgID := subjectOrgID(r.Context())
	staffID := subjectID(r.Context())

	params := map[string]any{
		"patient_id":              req.PatientID,
		"organization_id":         orgID,
		"assigned_provider_id":    req.AssignedProviderID,
		"lmp":                     req.LMP,
		"expected_delivery_date":  req.ExpectedDeliveryDate,
		"gestational_age_weeks":   req.GestationalAgeWeeks,
		"trimester":               req.Trimester,
		"gravidity":               req.Gravidity,
		"parity":                  req.Parity,
		"high_risk":               req.HighRisk,
		"risk_factors":            req.RiskFactors,
		"existing_conditions":     req.ExistingConditions,
		"monitoring_requirements": map[string]any{},
		"notes":                   req.Notes,
		"severity_level":          req.SeverityLevel,
		"created_by":              staffID,
	}

	episode, err := h.svcs.PatientPortal.OrgCreatePregnancyEpisode(r.Context(), params)
	if err != nil {
		log.Printf("OrgCreatePregnancyEpisode error: %v", err)
		h.errorJSON(w, http.StatusInternalServerError, "failed to create pregnancy episode")
		return
	}
	h.writeJSON(w, http.StatusCreated, episode)
}

// ── Org: Chronic Care Management ────────────────────────────────────────────

func (h *Handler) OrgListChronicEnrollments(w http.ResponseWriter, r *http.Request) {
	orgID := subjectOrgID(r.Context())
	limit := parseLimit(r, 100)
	items, err := h.svcs.PatientPortal.OrgListChronicEnrollments(r.Context(), orgID, limit)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list chronic enrollments")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) OrgCreateChronicEnrollment(w http.ResponseWriter, r *http.Request) {
	var req struct {
		PatientID           string         `json:"patient_id"`
		AssignedProviderID  *string        `json:"assigned_provider_id"`
		ConditionName       string         `json:"condition_name"`
		ICDCode             *string        `json:"icd_code"`
		CarePlan            string         `json:"care_plan"`
		AlertThresholds     map[string]any `json:"alert_thresholds"`
		MonitoringFrequency string         `json:"monitoring_frequency"`
		SeverityLevel       string         `json:"severity_level"`
		RiskScore           float64        `json:"risk_score"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.PatientID == "" || req.ConditionName == "" {
		h.errorJSON(w, http.StatusBadRequest, "patient_id and condition_name are required")
		return
	}
	if req.SeverityLevel == "" {
		req.SeverityLevel = "green"
	}
	if req.MonitoringFrequency == "" {
		req.MonitoringFrequency = "daily"
	}
	if req.AlertThresholds == nil {
		req.AlertThresholds = map[string]any{}
	}

	orgID := subjectOrgID(r.Context())
	staffID := subjectID(r.Context())

	params := map[string]any{
		"patient_id":           req.PatientID,
		"organization_id":      orgID,
		"assigned_provider_id": req.AssignedProviderID,
		"condition_name":       req.ConditionName,
		"icd_code":             req.ICDCode,
		"care_plan":            req.CarePlan,
		"alert_thresholds":     req.AlertThresholds,
		"monitoring_frequency": req.MonitoringFrequency,
		"severity_level":       req.SeverityLevel,
		"risk_score":           req.RiskScore,
		"created_by":           staffID,
	}

	enrollment, err := h.svcs.PatientPortal.OrgCreateChronicEnrollment(r.Context(), params)
	if err != nil {
		log.Printf("OrgCreateChronicEnrollment error: %v", err)
		h.errorJSON(w, http.StatusInternalServerError, "failed to create chronic enrollment")
		return
	}
	h.writeJSON(w, http.StatusCreated, enrollment)
}

