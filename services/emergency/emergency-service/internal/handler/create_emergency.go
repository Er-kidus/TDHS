package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/emergency-service/internal/dto"
)

// CreateEmergency handles POST requests to create a new emergency.
func (h *Handler) CreateEmergency(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateEmergencyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateEmergency(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
