package handler

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/tenadam/api-gateway/internal/model"
	"github.com/tenadam/api-gateway/internal/repository"
	"github.com/tenadam/api-gateway/internal/service"
)

func appointmentBelongsToOrganization(appt *model.Appointment, organizationID string) bool {
	if appt == nil || strings.TrimSpace(organizationID) == "" {
		return false
	}
	orgID := strings.ToLower(strings.TrimSpace(organizationID))
	if appt.FacilityID != nil && strings.ToLower(strings.TrimSpace(*appt.FacilityID)) == orgID {
		return true
	}
	if appt.NearbyHospitalID != nil && strings.ToLower(strings.TrimSpace(*appt.NearbyHospitalID)) == orgID {
		return true
	}
	return false
}

type createAppointmentRequest struct {
	ScheduledAt              string   `json:"scheduledAt"`
	Reason                   *string  `json:"reason"`
	Notes                    *string  `json:"notes"`
	Description              *string  `json:"description"`
	Priority                 *string  `json:"priority"`
	AppointmentType          *string  `json:"appointmentType"`
	ServiceType              *string  `json:"serviceType"`
	ServiceCategory          *string  `json:"serviceCategory"`
	FacilityID               *string  `json:"facilityId"`
	FacilityName             *string  `json:"facilityName"`
	FacilityAddress          *string  `json:"facilityAddress"`
	NearbyHospitalID         *string  `json:"nearbyHospitalId"`
	NearbyHospitalName       *string  `json:"nearbyHospitalName"`
	NearbyHospitalAddress    *string  `json:"nearbyHospitalAddress"`
	NearbyHospitalDistanceKm *float64 `json:"nearbyHospitalDistanceKm"`
	Location                 *string  `json:"location"`
}

type updateAppointmentRequest struct {
	ScheduledAt              *string  `json:"scheduledAt"`
	Status                   *string  `json:"status"`
	Reason                   *string  `json:"reason"`
	Notes                    *string  `json:"notes"`
	Description              *string  `json:"description"`
	Priority                 *string  `json:"priority"`
	AppointmentType          *string  `json:"appointmentType"`
	ServiceType              *string  `json:"serviceType"`
	ServiceCategory          *string  `json:"serviceCategory"`
	FacilityID               *string  `json:"facilityId"`
	FacilityName             *string  `json:"facilityName"`
	FacilityAddress          *string  `json:"facilityAddress"`
	NearbyHospitalID         *string  `json:"nearbyHospitalId"`
	NearbyHospitalName       *string  `json:"nearbyHospitalName"`
	NearbyHospitalAddress    *string  `json:"nearbyHospitalAddress"`
	NearbyHospitalDistanceKm *float64 `json:"nearbyHospitalDistanceKm"`
	Location                 *string  `json:"location"`
	AssignedStaffType        *string  `json:"assignedStaffType"`
	AssignedRoom             *string  `json:"assignedRoom"`
	AssignedEquipment        *string  `json:"assignedEquipment"`
}

func (h *Handler) CreateAppointment(w http.ResponseWriter, r *http.Request) {
	typ := tokenType(r.Context())
	sub := subjectID(r.Context())

	var req createAppointmentRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	when, err := time.Parse(time.RFC3339, req.ScheduledAt)
	if err != nil {
		h.errorJSON(w, http.StatusBadRequest, "scheduledAt must be RFC3339")
		return
	}

	patientID := sub
	var createdBy *string
	if typ == service.TokenTypeOrg {
		createdBy = &sub
		if r.URL.Query().Get("patientId") != "" {
			patientID = r.URL.Query().Get("patientId")
		}
	}

	appt, err := h.svcs.Appointments.Create(
		r.Context(),
		patientID,
		createdBy,
		when,
		req.Reason,
		req.Notes,
		req.Description,
		req.Priority,
		req.AppointmentType,
		req.ServiceType,
		req.ServiceCategory,
		req.FacilityID,
		req.FacilityName,
		req.FacilityAddress,
		req.NearbyHospitalID,
		req.NearbyHospitalName,
		req.NearbyHospitalAddress,
		req.NearbyHospitalDistanceKm,
		req.Location,
	)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to create appointment")
		return
	}
	h.writeJSON(w, http.StatusCreated, appt)
}

func (h *Handler) ListAppointments(w http.ResponseWriter, r *http.Request) {
	typ := tokenType(r.Context())
	sub := subjectID(r.Context())
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	if typ == service.TokenTypeOrg {
		orgID := subjectOrgID(r.Context())
		if orgID == "" {
			h.errorJSON(w, http.StatusForbidden, "organization context is missing")
			return
		}
		items, err := h.svcs.Appointments.ListForOrganization(r.Context(), orgID, limit)
		if err != nil {
			h.errorJSON(w, http.StatusInternalServerError, "failed to list appointments")
			return
		}
		h.writeJSON(w, http.StatusOK, items)
		return
	}
	items, err := h.svcs.Appointments.ListForPatient(r.Context(), sub, limit)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list appointments")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) GetAppointment(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	appt, err := h.svcs.Appointments.GetByID(r.Context(), id)
	if err != nil {
		if err == repository.ErrNotFound {
			h.errorJSON(w, http.StatusNotFound, "appointment not found")
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to get appointment")
		return
	}
	// Enforce patient ownership
	if tokenType(r.Context()) == service.TokenTypePatient {
		if appt.PatientID != subjectID(r.Context()) {
			h.errorJSON(w, http.StatusForbidden, "forbidden")
			return
		}
	} else if tokenType(r.Context()) == service.TokenTypeOrg {
		if !appointmentBelongsToOrganization(appt, subjectOrgID(r.Context())) {
			h.errorJSON(w, http.StatusForbidden, "forbidden")
			return
		}
	}
	h.writeJSON(w, http.StatusOK, appt)
}

func (h *Handler) UpdateAppointment(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var req updateAppointmentRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	current, err := h.svcs.Appointments.GetByID(r.Context(), id)
	if err != nil {
		if err == repository.ErrNotFound {
			h.errorJSON(w, http.StatusNotFound, "appointment not found")
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to get appointment")
		return
	}
	if tokenType(r.Context()) == service.TokenTypePatient {
		if current.PatientID != subjectID(r.Context()) {
			h.errorJSON(w, http.StatusForbidden, "forbidden")
			return
		}
		// Patients can only cancel their own appointments.
		if req.Status != nil {
			if *req.Status != "cancelled" {
				req.Status = nil
			}
		}
		req.AssignedStaffType = nil
		req.AssignedRoom = nil
		req.AssignedEquipment = nil
	} else if tokenType(r.Context()) == service.TokenTypeOrg {
		orgID := subjectOrgID(r.Context())
		if !appointmentBelongsToOrganization(current, orgID) {
			h.errorJSON(w, http.StatusForbidden, "forbidden")
			return
		}
		if req.FacilityID != nil && strings.TrimSpace(*req.FacilityID) != "" && !strings.EqualFold(strings.TrimSpace(*req.FacilityID), orgID) {
			h.errorJSON(w, http.StatusForbidden, "organization can only manage its own facilities")
			return
		}
	}

	var scheduledAt *time.Time
	if req.ScheduledAt != nil {
		parsed, err := time.Parse(time.RFC3339, *req.ScheduledAt)
		if err != nil {
			h.errorJSON(w, http.StatusBadRequest, "scheduledAt must be RFC3339")
			return
		}
		scheduledAt = &parsed
	}
	updated, err := h.svcs.Appointments.Update(
		r.Context(),
		id,
		scheduledAt,
		req.Status,
		req.Reason,
		req.Notes,
		req.Description,
		req.Priority,
		req.AppointmentType,
		req.ServiceType,
		req.ServiceCategory,
		req.FacilityID,
		req.FacilityName,
		req.FacilityAddress,
		req.NearbyHospitalID,
		req.NearbyHospitalName,
		req.NearbyHospitalAddress,
		req.NearbyHospitalDistanceKm,
		req.Location,
		req.AssignedStaffType,
		req.AssignedRoom,
		req.AssignedEquipment,
	)
	if err != nil {
		if err == repository.ErrNotFound {
			h.errorJSON(w, http.StatusNotFound, "appointment not found")
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to update appointment")
		return
	}
	h.writeJSON(w, http.StatusOK, updated)
}

func (h *Handler) DeleteAppointment(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	current, err := h.svcs.Appointments.GetByID(r.Context(), id)
	if err != nil {
		if err == repository.ErrNotFound {
			h.errorJSON(w, http.StatusNotFound, "appointment not found")
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to get appointment")
		return
	}
	if tokenType(r.Context()) == service.TokenTypePatient {
		if current.PatientID != subjectID(r.Context()) {
			h.errorJSON(w, http.StatusForbidden, "forbidden")
			return
		}
	} else if tokenType(r.Context()) == service.TokenTypeOrg {
		if !appointmentBelongsToOrganization(current, subjectOrgID(r.Context())) {
			h.errorJSON(w, http.StatusForbidden, "forbidden")
			return
		}
	}
	if err := h.svcs.Appointments.Delete(r.Context(), id); err != nil {
		if err == repository.ErrNotFound {
			h.errorJSON(w, http.StatusNotFound, "appointment not found")
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to delete appointment")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
