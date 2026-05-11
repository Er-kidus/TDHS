package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/appointment-service/internal/dto"
)

// UpdateAppointment handles PUT requests to update an existing appointment.
func (h *Handler) UpdateAppointment(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateAppointmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateAppointment(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
