package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/emergency-service/internal/dto"
)

// UpdateEmergency handles PUT requests to update an existing emergency.
func (h *Handler) UpdateEmergency(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateEmergencyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateEmergency(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
