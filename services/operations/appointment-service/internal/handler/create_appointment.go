package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/appointment-service/internal/dto"
)

// CreateAppointment handles POST requests to create a new appointment.
func (h *Handler) CreateAppointment(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateAppointmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateAppointment(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
