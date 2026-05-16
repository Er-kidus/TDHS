package handler

import (
	"encoding/json"
	"net/http"
)

// ── Org: Community Areas ───────────────────────────────────────────────────────

func (h *Handler) OrgCreateCommunityArea(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		RegionCode  string `json:"region_code"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Name == "" {
		h.errorJSON(w, http.StatusBadRequest, "name is required")
		return
	}

	orgID := subjectOrgID(r.Context())
	area, err := h.svcs.Community.OrgCreateCommunityArea(r.Context(), orgID, req.Name, req.Description, req.RegionCode)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to create community area")
		return
	}
	h.writeJSON(w, http.StatusCreated, area)
}

func (h *Handler) OrgListCommunityAreas(w http.ResponseWriter, r *http.Request) {
	orgID := subjectOrgID(r.Context())
	limit := parseLimit(r, 100)
	areas, err := h.svcs.Community.OrgListCommunityAreas(r.Context(), orgID, limit)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list community areas")
		return
	}
	h.writeJSON(w, http.StatusOK, areas)
}

// ── Org: Households ────────────────────────────────────────────────────────────

func (h *Handler) OrgCreateHousehold(w http.ResponseWriter, r *http.Request) {
	var req struct {
		AreaID         *string        `json:"area_id"`
		HeadName       string         `json:"head_name"`
		ContactNumber  string         `json:"contact_number"`
		Address        string         `json:"address"`
		GPSCoordinates map[string]any `json:"gps_coordinates"`
		RiskLevel      string         `json:"risk_level"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.HeadName == "" {
		h.errorJSON(w, http.StatusBadRequest, "head_name is required")
		return
	}
	if req.RiskLevel == "" {
		req.RiskLevel = "green"
	}
	if req.GPSCoordinates == nil {
		req.GPSCoordinates = map[string]any{}
	}

	orgID := subjectOrgID(r.Context())
	params := map[string]any{
		"area_id":         req.AreaID,
		"head_name":       req.HeadName,
		"contact_number":  req.ContactNumber,
		"address":         req.Address,
		"gps_coordinates": req.GPSCoordinates,
		"risk_level":      req.RiskLevel,
	}

	household, err := h.svcs.Community.OrgCreateHousehold(r.Context(), orgID, params)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to create household")
		return
	}
	h.writeJSON(w, http.StatusCreated, household)
}

func (h *Handler) OrgListHouseholds(w http.ResponseWriter, r *http.Request) {
	orgID := subjectOrgID(r.Context())
	areaID := r.URL.Query().Get("area_id")
	limit := parseLimit(r, 100)

	households, err := h.svcs.Community.OrgListHouseholds(r.Context(), orgID, areaID, limit)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list households")
		return
	}
	h.writeJSON(w, http.StatusOK, households)
}

// ── Org: Household Members ─────────────────────────────────────────────────────

func (h *Handler) OrgAddHouseholdMember(w http.ResponseWriter, r *http.Request) {
	hhID := r.PathValue("id")
	if hhID == "" {
		h.errorJSON(w, http.StatusBadRequest, "household ID is required")
		return
	}

	var req struct {
		PatientID    *string `json:"patient_id"`
		FullName     string  `json:"full_name"`
		DateOfBirth  *string `json:"date_of_birth"`
		Gender       string  `json:"gender"`
		Relationship string  `json:"relationship"`
		IsPregnant   bool    `json:"is_pregnant"`
		HasChronic   bool    `json:"has_chronic"`
		RiskLevel    string  `json:"risk_level"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.FullName == "" {
		h.errorJSON(w, http.StatusBadRequest, "full_name is required")
		return
	}
	if req.RiskLevel == "" {
		req.RiskLevel = "green"
	}

	params := map[string]any{
		"patient_id":    req.PatientID,
		"full_name":     req.FullName,
		"date_of_birth": req.DateOfBirth,
		"gender":        req.Gender,
		"relationship":  req.Relationship,
		"is_pregnant":   req.IsPregnant,
		"has_chronic":   req.HasChronic,
		"risk_level":    req.RiskLevel,
	}

	member, err := h.svcs.Community.OrgAddHouseholdMember(r.Context(), hhID, params)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to add household member")
		return
	}
	h.writeJSON(w, http.StatusCreated, member)
}

func (h *Handler) OrgListHouseholdMembers(w http.ResponseWriter, r *http.Request) {
	hhID := r.PathValue("id")
	if hhID == "" {
		h.errorJSON(w, http.StatusBadRequest, "household ID is required")
		return
	}

	members, err := h.svcs.Community.OrgListHouseholdMembers(r.Context(), hhID)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list household members")
		return
	}
	h.writeJSON(w, http.StatusOK, members)
}

// ── Org: Community Visits ──────────────────────────────────────────────────────

func (h *Handler) OrgLogCommunityVisit(w http.ResponseWriter, r *http.Request) {
	var req struct {
		HouseholdID     string         `json:"household_id"`
		MemberID        *string        `json:"member_id"`
		VisitType       string         `json:"visit_type"`
		VitalsLogged    map[string]any `json:"vitals_logged"`
		Symptoms        []string       `json:"symptoms"`
		Notes           string         `json:"notes"`
		TriageEscalated bool           `json:"triage_escalated"`
		TriageReason    string         `json:"triage_reason"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.HouseholdID == "" {
		h.errorJSON(w, http.StatusBadRequest, "household_id is required")
		return
	}
	if req.VisitType == "" {
		req.VisitType = "routine"
	}

	orgID := subjectOrgID(r.Context())
	agentID := subjectID(r.Context()) // User logging the visit is the agent

	params := map[string]any{
		"household_id":     req.HouseholdID,
		"member_id":        req.MemberID,
		"visit_type":       req.VisitType,
		"vitals_logged":    req.VitalsLogged,
		"symptoms":         req.Symptoms,
		"notes":            req.Notes,
		"triage_escalated": req.TriageEscalated,
		"triage_reason":    req.TriageReason,
	}

	visit, err := h.svcs.Community.OrgLogCommunityVisit(r.Context(), orgID, agentID, params)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to log community visit")
		return
	}
	h.writeJSON(w, http.StatusCreated, visit)
}

func (h *Handler) OrgListCommunityVisits(w http.ResponseWriter, r *http.Request) {
	orgID := subjectOrgID(r.Context())
	hhID := r.URL.Query().Get("household_id")
	limit := parseLimit(r, 100)

	visits, err := h.svcs.Community.OrgListCommunityVisits(r.Context(), orgID, hhID, limit)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list community visits")
		return
	}
	h.writeJSON(w, http.StatusOK, visits)
}
