package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/facility-service/internal/dto"
)

// UpdateFacility handles PUT requests to update an existing facility.
func (h *Handler) UpdateFacility(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateFacilityRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateFacility(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
