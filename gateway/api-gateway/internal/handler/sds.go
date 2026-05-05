package handler

import (
	"net/http"

	"github.com/tenadam/api-gateway/internal/model"
	"github.com/tenadam/api-gateway/internal/repository"
)

type serviceRequest struct {
	Name                string  `json:"name"`
	Description         *string `json:"description"`
	ServiceCategory     string  `json:"serviceCategory"`
	ServiceType         string  `json:"serviceType"`
	Active              *bool   `json:"active"`
	DurationMinutes     int     `json:"duration_minutes"`
	BufferBeforeMinutes int     `json:"buffer_before_minutes"`
	BufferAfterMinutes  int     `json:"buffer_after_minutes"`
	RequiresAppointment *bool   `json:"requires_appointment"`
	AllowsWalkin        *bool   `json:"allows_walkin"`
	RequiresCheckin     *bool   `json:"requires_checkin"`
	SupportsRecurrence  *bool   `json:"supports_recurrence"`
	AllowedPatternsJSON string  `json:"allowed_patterns"`
	MaxOccurrences      *int    `json:"max_occurrences"`
}

type assignResourceRequest struct {
	StaffType *string `json:"assignedStaffType"`
	Room      *string `json:"assignedRoom"`
	Equipment *string `json:"assignedEquipment"`
}

type reorderQueueRequest struct {
	QueueID               string   `json:"queueId"`
	OrderedAppointmentIDs []string `json:"orderedAppointmentIds"`
}

type checkInQueueRequest struct {
	AppointmentID    string `json:"appointmentId"`
	AppointmentIDAlt string `json:"appointment_id"`
}

func (h *Handler) ListServices(w http.ResponseWriter, r *http.Request) {
	items, err := h.svcs.SDS.ListServices(r.Context())
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list services")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) CreateService(w http.ResponseWriter, r *http.Request) {
	var req serviceRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	active := true
	if req.Active != nil {
		active = *req.Active
	}
	requiresAppointment := true
	if req.RequiresAppointment != nil {
		requiresAppointment = *req.RequiresAppointment
	}
	allowsWalkin := true
	if req.AllowsWalkin != nil {
		allowsWalkin = *req.AllowsWalkin
	}
	requiresCheckin := true
	if req.RequiresCheckin != nil {
		requiresCheckin = *req.RequiresCheckin
	}
	supportsRecurrence := false
	if req.SupportsRecurrence != nil {
		supportsRecurrence = *req.SupportsRecurrence
	}

	item := &model.ServiceDefinition{
		Name:                req.Name,
		Description:         req.Description,
		ServiceCategory:     req.ServiceCategory,
		ServiceType:         req.ServiceType,
		Active:              active,
		DurationMinutes:     req.DurationMinutes,
		BufferBeforeMinutes: req.BufferBeforeMinutes,
		BufferAfterMinutes:  req.BufferAfterMinutes,
		RequiresAppointment: requiresAppointment,
		AllowsWalkin:        allowsWalkin,
		RequiresCheckin:     requiresCheckin,
		SupportsRecurrence:  supportsRecurrence,
		AllowedPatternsJSON: req.AllowedPatternsJSON,
		MaxOccurrences:      req.MaxOccurrences,
	}
	created, err := h.svcs.SDS.CreateService(r.Context(), item)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to create service")
		return
	}
	h.writeJSON(w, http.StatusCreated, created)
}

func (h *Handler) UpdateService(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var req serviceRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	active := true
	if req.Active != nil {
		active = *req.Active
	}
	requiresAppointment := true
	if req.RequiresAppointment != nil {
		requiresAppointment = *req.RequiresAppointment
	}
	allowsWalkin := true
	if req.AllowsWalkin != nil {
		allowsWalkin = *req.AllowsWalkin
	}
	requiresCheckin := true
	if req.RequiresCheckin != nil {
		requiresCheckin = *req.RequiresCheckin
	}
	supportsRecurrence := false
	if req.SupportsRecurrence != nil {
		supportsRecurrence = *req.SupportsRecurrence
	}
	item := &model.ServiceDefinition{
		Name:                req.Name,
		Description:         req.Description,
		ServiceCategory:     req.ServiceCategory,
		ServiceType:         req.ServiceType,
		Active:              active,
		DurationMinutes:     req.DurationMinutes,
		BufferBeforeMinutes: req.BufferBeforeMinutes,
		BufferAfterMinutes:  req.BufferAfterMinutes,
		RequiresAppointment: requiresAppointment,
		AllowsWalkin:        allowsWalkin,
		RequiresCheckin:     requiresCheckin,
		SupportsRecurrence:  supportsRecurrence,
		AllowedPatternsJSON: req.AllowedPatternsJSON,
		MaxOccurrences:      req.MaxOccurrences,
	}
	updated, err := h.svcs.SDS.UpdateService(r.Context(), id, item)
	if err != nil {
		if err == repository.ErrNotFound {
			h.errorJSON(w, http.StatusNotFound, "service not found")
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to update service")
		return
	}
	h.writeJSON(w, http.StatusOK, updated)
}

func (h *Handler) DeleteService(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if err := h.svcs.SDS.DeleteService(r.Context(), id); err != nil {
		if err == repository.ErrNotFound {
			h.errorJSON(w, http.StatusNotFound, "service not found")
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to delete service")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) ListResources(w http.ResponseWriter, r *http.Request) {
	items, err := h.svcs.SDS.ListResources(r.Context())
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list resources")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) AssignAppointmentResources(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	appointment, err := h.svcs.Appointments.GetByID(r.Context(), id)
	if err != nil {
		if err == repository.ErrNotFound {
			h.errorJSON(w, http.StatusNotFound, "appointment not found")
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to load appointment")
		return
	}
	if !appointmentBelongsToOrganization(appointment, subjectOrgID(r.Context())) {
		h.errorJSON(w, http.StatusForbidden, "forbidden")
		return
	}

	var req assignResourceRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	updated, err := h.svcs.SDS.AssignResources(r.Context(), &id, req.StaffType, req.Room, req.Equipment)
	if err != nil {
		if err == repository.ErrNotFound {
			h.errorJSON(w, http.StatusNotFound, "appointment not found")
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to assign resources")
		return
	}
	h.writeJSON(w, http.StatusOK, updated)
}

func (h *Handler) ListQueues(w http.ResponseWriter, r *http.Request) {
	items, err := h.svcs.SDS.ListQueueEntries(r.Context())
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list queues")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) ReorderQueue(w http.ResponseWriter, r *http.Request) {
	var req reorderQueueRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.QueueID == "" || len(req.OrderedAppointmentIDs) == 0 {
		h.errorJSON(w, http.StatusBadRequest, "queueId and orderedAppointmentIds are required")
		return
	}
	if err := h.svcs.SDS.ReorderQueue(r.Context(), req.QueueID, req.OrderedAppointmentIDs); err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to reorder queue")
		return
	}
	h.writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (h *Handler) CheckInQueue(w http.ResponseWriter, r *http.Request) {
	var req checkInQueueRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.AppointmentID == "" {
		req.AppointmentID = req.AppointmentIDAlt
	}
	if req.AppointmentID == "" {
		h.errorJSON(w, http.StatusBadRequest, "appointmentId is required")
		return
	}
	if err := h.svcs.SDS.CheckInAppointment(r.Context(), req.AppointmentID); err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to check-in queue")
		return
	}
	h.writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}
