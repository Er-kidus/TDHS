package handler

import (
	"net/http"
	"strings"
	"time"

	"github.com/tenadam/api-gateway/internal/service"
)

func isTranscriptStoreUnavailable(err error) bool {
	if err == nil {
		return false
	}
	msg := strings.ToLower(err.Error())
	return strings.Contains(msg, "telemedicine_transcript_lines") || strings.Contains(msg, "relation") && strings.Contains(msg, "does not exist")
}

func normalizeLiveKitURL(raw string) string {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return ""
	}
	if strings.Contains(strings.ToLower(trimmed), "localhost") {
		return strings.ReplaceAll(trimmed, "localhost", "127.0.0.1")
	}
	return trimmed
}

type issueLiveKitTokenRequest struct {
	SessionID   string `json:"session_id"`
	RoomName    string `json:"room_name"`
	Identity    string `json:"identity"`
	DisplayName string `json:"display_name"`
	Role        string `json:"role"`
}

func (h *Handler) IssueLiveKitToken(w http.ResponseWriter, r *http.Request) {
	var req issueLiveKitTokenRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	session, err := h.svcs.PatientPortal.GetTelemedicineSessionByID(r.Context(), req.SessionID)
	if err != nil {
		if mapRepoErr(h, w, err) {
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to load session")
		return
	}
	sub := subjectID(r.Context())
	typ := tokenType(r.Context())
	if typ == service.TokenTypePatient && session.PatientID != sub {
		h.errorJSON(w, http.StatusForbidden, "forbidden")
		return
	}
	if typ == service.TokenTypeOrg && session.DoctorID != nil {
		assignedDoctorID := strings.TrimSpace(*session.DoctorID)
		if assignedDoctorID != "" && assignedDoctorID != sub {
			h.errorJSON(w, http.StatusForbidden, "session is assigned to another practitioner")
			return
		}
	}
	if req.RoomName == "" {
		req.RoomName = h.svcs.PatientPortal.GenerateLiveKitRoomName(req.SessionID)
	}
	if req.Identity == "" {
		req.Identity = sub
	}
	if req.DisplayName == "" {
		req.DisplayName = req.Identity
	}
	if req.Role == "" {
		if typ == service.TokenTypeOrg {
			req.Role = "doctor"
		} else {
			req.Role = "patient"
		}
	}
	if typ == service.TokenTypePatient {
		req.Role = "patient"
	}
	if typ == service.TokenTypeOrg && req.Role != "doctor" && req.Role != "org" {
		req.Role = "doctor"
	}
	token, err := h.svcs.PatientPortal.GenerateLiveKitSessionToken(req.Identity, req.RoomName, req.DisplayName, req.Role)
	if err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	if typ == service.TokenTypeOrg && (req.Role == "doctor" || req.Role == "org") {
		if _, err := h.svcs.PatientPortal.MarkTelemedicineSessionInProgress(r.Context(), req.SessionID, sub); err != nil {
			if mapRepoErr(h, w, err) {
				h.errorJSON(w, http.StatusNotFound, "session not found")
				return
			}
			h.errorJSON(w, http.StatusInternalServerError, "failed to start telemedicine session")
			return
		}
	}
	serverURL := strings.TrimSpace(h.cfg.LiveKitPublicURL)
	if serverURL == "" {
		serverURL = h.cfg.LiveKitURL
	}
	h.writeJSON(w, http.StatusOK, map[string]any{
		"session_id":   req.SessionID,
		"room_name":    req.RoomName,
		"identity":     req.Identity,
		"display_name": req.DisplayName,
		"role":         req.Role,
		"url":          normalizeLiveKitURL(serverURL),
		"token":        token,
	})
}

type createTelemedicineSummaryRequest struct {
	Transcript     string   `json:"transcript"`
	DoctorNotes    string   `json:"doctor_notes"`
	Symptoms       []string `json:"symptoms"`
	Language       string   `json:"language"`
	RecordingURL   *string  `json:"recording_url"`
	TranscriptURL  *string  `json:"transcript_url"`
	DoctorID       *string  `json:"doctor_id"`
	FinalDiagnosis string   `json:"final_diagnosis"`
	FollowUpDays   *int     `json:"follow_up_days"`
	CreateFollowUp bool     `json:"create_follow_up"`
}

type createTelemedicineTranscriptLineRequest struct {
	Speaker    string     `json:"speaker"`
	Source     string     `json:"source"`
	Content    string     `json:"content"`
	OccurredAt *time.Time `json:"occurred_at"`
}

func (h *Handler) CreateTelemedicineTranscriptLine(w http.ResponseWriter, r *http.Request) {
	var req createTelemedicineTranscriptLineRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	sessionID := r.PathValue("id")
	session, err := h.svcs.PatientPortal.GetTelemedicineSessionByID(r.Context(), sessionID)
	if err != nil {
		if mapRepoErr(h, w, err) {
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to load session")
		return
	}
	if tokenType(r.Context()) == service.TokenTypePatient && session.PatientID != subjectID(r.Context()) {
		h.errorJSON(w, http.StatusForbidden, "forbidden")
		return
	}
	if strings.TrimSpace(req.Speaker) == "" || strings.TrimSpace(req.Content) == "" {
		h.errorJSON(w, http.StatusBadRequest, "speaker and content are required")
		return
	}
	if req.Source == "" {
		req.Source = "manual"
	}
	item, err := h.svcs.PatientPortal.CreateTelemedicineTranscriptLine(
		r.Context(),
		sessionID,
		session.PatientID,
		strings.TrimSpace(req.Speaker),
		strings.TrimSpace(req.Source),
		strings.TrimSpace(req.Content),
		req.OccurredAt,
	)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to save transcript line")
		return
	}
	h.writeJSON(w, http.StatusCreated, item)
}

func (h *Handler) ListTelemedicineTranscriptLines(w http.ResponseWriter, r *http.Request) {
	sessionID := r.PathValue("id")
	session, err := h.svcs.PatientPortal.GetTelemedicineSessionByID(r.Context(), sessionID)
	if err != nil {
		if mapRepoErr(h, w, err) {
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to load session")
		return
	}
	if tokenType(r.Context()) == service.TokenTypePatient && session.PatientID != subjectID(r.Context()) {
		h.errorJSON(w, http.StatusForbidden, "forbidden")
		return
	}
	items, err := h.svcs.PatientPortal.ListTelemedicineTranscriptLinesBySession(r.Context(), sessionID, parseLimit(r, 300))
	if err != nil {
		if isTranscriptStoreUnavailable(err) {
			h.writeJSON(w, http.StatusOK, []any{})
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to list transcript lines")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) CreateTelemedicineSummary(w http.ResponseWriter, r *http.Request) {
	var req createTelemedicineSummaryRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	session, err := h.svcs.PatientPortal.GetTelemedicineSessionByID(r.Context(), r.PathValue("id"))
	if err != nil {
		if mapRepoErr(h, w, err) {
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to load session")
		return
	}
	patientID := subjectID(r.Context())
	if tokenType(r.Context()) == service.TokenTypeOrg {
		patientID = session.PatientID
	}
	result, err := h.svcs.PatientPortal.SummarizeTelemedicineSession(r.Context(), patientID, service.TelemedicineSummaryInput{
		SessionID:      r.PathValue("id"),
		Language:       req.Language,
		Transcript:     req.Transcript,
		DoctorNotes:    req.DoctorNotes,
		Symptoms:       req.Symptoms,
		RecordingURL:   req.RecordingURL,
		TranscriptURL:  req.TranscriptURL,
		DoctorID:       req.DoctorID,
		FinalDiagnosis: req.FinalDiagnosis,
		FollowUpDays:   req.FollowUpDays,
	})
	if err != nil {
		if mapRepoErr(h, w, err) {
			return
		}
		status := http.StatusBadRequest
		if strings.Contains(strings.ToLower(err.Error()), "not configured") {
			status = http.StatusServiceUnavailable
		}
		h.errorJSON(w, status, err.Error())
		return
	}
	if result.FollowUpNeeded || req.CreateFollowUp {
		days := result.RecommendedFollowUpDays
		if days <= 0 {
			days = 7
		}
		when := time.Now().UTC().Add(time.Duration(days) * 24 * time.Hour)
		reason := result.FinalDiagnosis
		if strings.TrimSpace(reason) == "" {
			reason = "Telemedicine follow-up"
		}
		notes := req.DoctorNotes
		appt, apptErr := h.svcs.Appointments.Create(
			r.Context(),
			result.Artifact.PatientID,
			nil,
			when,
			&reason,
			&notes,
			nil,
			nil,
			nil,
			nil,
			nil,
			nil,
			nil,
			nil,
			nil,
			nil,
			nil,
			nil,
			nil,
		)
		if apptErr != nil {
			h.errorJSON(w, http.StatusInternalServerError, "failed to create follow-up appointment")
			return
		}
		result.FollowUpAppointment = appt
	}
	h.writeJSON(w, http.StatusOK, result)
}
