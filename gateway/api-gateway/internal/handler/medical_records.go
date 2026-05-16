package handler

import (
	"net/http"
	"strings"
	"time"
)

// ─── Medical Records (Visit Summaries) ───────────────────────────────────────

func (h *Handler) GetMedicalRecords(w http.ResponseWriter, r *http.Request) {
	patientID := subjectID(r.Context())
	if strings.TrimSpace(patientID) == "" {
		h.errorJSON(w, http.StatusUnauthorized, "patient id is required")
		return
	}
	items, err := h.svcs.PatientPortal.ListVisitSummaries(r.Context(), patientID, parseLimit(r, 50))
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to retrieve medical records")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

// ─── Lab Orders ───────────────────────────────────────────────────────────────

func (h *Handler) ListPatientLabOrders(w http.ResponseWriter, r *http.Request) {
	patientID := subjectID(r.Context())
	if strings.TrimSpace(patientID) == "" {
		h.errorJSON(w, http.StatusUnauthorized, "patient id is required")
		return
	}
	items, err := h.svcs.PatientPortal.ListLabOrders(r.Context(), patientID, parseLimit(r, 50))
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to retrieve lab orders")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

// ─── Doctor Prescriptions ─────────────────────────────────────────────────────

func (h *Handler) ListPatientDoctorPrescriptions(w http.ResponseWriter, r *http.Request) {
	patientID := subjectID(r.Context())
	if strings.TrimSpace(patientID) == "" {
		h.errorJSON(w, http.StatusUnauthorized, "patient id is required")
		return
	}
	items, err := h.svcs.PatientPortal.ListDoctorPrescriptions(r.Context(), patientID, parseLimit(r, 50))
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to retrieve prescriptions")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

// ─── AI Appointment Scheduling ────────────────────────────────────────────────

type aiScheduleRequest struct {
	ScheduledAt     string  `json:"scheduledAt"`
	ServiceType     *string `json:"serviceType"`
	ServiceCategory *string `json:"serviceCategory"`
	FacilityID      *string `json:"facilityId"`
	FacilityName    *string `json:"facilityName"`
	FacilityAddress *string `json:"facilityAddress"`
	Reason          *string `json:"reason"`
	Notes           *string `json:"notes"`
	Priority        *string `json:"priority"`
	AppointmentType *string `json:"appointmentType"`
	Location        *string `json:"location"`
}

func (h *Handler) AIScheduleAppointment(w http.ResponseWriter, r *http.Request) {
	patientID := subjectID(r.Context())
	if strings.TrimSpace(patientID) == "" {
		h.errorJSON(w, http.StatusUnauthorized, "patient id is required")
		return
	}

	var req aiScheduleRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	if strings.TrimSpace(req.ScheduledAt) == "" {
		h.errorJSON(w, http.StatusBadRequest, "scheduledAt is required")
		return
	}

	when, err := time.Parse(time.RFC3339, req.ScheduledAt)
	if err != nil {
		// Try with milliseconds
		when, err = time.Parse("2006-01-02T15:04:05.000Z", req.ScheduledAt)
		if err != nil {
			h.errorJSON(w, http.StatusBadRequest, "scheduledAt must be a valid RFC3339 date-time")
			return
		}
	}

	// Validate not in the past - Removed for testing purposes
	// if when.Before(time.Now().Add(-5 * time.Minute)) {
	// 	h.errorJSON(w, http.StatusBadRequest, "appointment cannot be scheduled in the past")
	// 	return
	// }

	// Conflict check — prevent double booking within 2 hours
	hasConflict, err := h.svcs.PatientPortal.CheckAppointmentConflict(r.Context(), patientID, when)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to check appointment conflicts")
		return
	}
	if hasConflict {
		h.errorJSON(w, http.StatusConflict, "you already have an appointment scheduled near that time; please choose a different time slot")
		return
	}

	apptType := "in-person"
	if req.AppointmentType != nil {
		apptType = *req.AppointmentType
	}
	apptTypePtr := &apptType

	priority := "routine"
	if req.Priority != nil {
		priority = *req.Priority
	}
	priorityPtr := &priority

	desc := "AI-booked appointment"
	if req.ServiceType != nil {
		desc = "AI-booked: " + strings.ReplaceAll(*req.ServiceType, "_", " ")
	}
	descPtr := &desc

	loc := ""
	if req.FacilityName != nil {
		loc = *req.FacilityName
	}
	locPtr := &loc

	appt, err := h.svcs.Appointments.Create(
		r.Context(),
		patientID,
		nil, // createdBy — nil for self-booked
		when,
		req.Reason,
		req.Notes,
		descPtr,
		priorityPtr,
		apptTypePtr,
		req.ServiceType,
		req.ServiceCategory,
		req.FacilityID,
		req.FacilityName,
		req.FacilityAddress,
		nil, nil, nil, nil, // nearby hospital fields — not needed for AI scheduling
		locPtr,
	)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to create appointment")
		return
	}

	h.writeJSON(w, http.StatusCreated, map[string]any{
		"appointment": appt,
		"message":     "Appointment successfully scheduled",
	})
}
