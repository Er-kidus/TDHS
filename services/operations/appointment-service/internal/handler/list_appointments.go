package handler

import (
	"encoding/json"
	"net/http"
)

// ListAppointments handles GET requests to list all appointments.
func (h *Handler) ListAppointments(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListAppointments(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
