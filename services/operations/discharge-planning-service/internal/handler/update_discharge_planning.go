package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/discharge-planning-service/internal/dto"
)

// UpdateDischargePlanning handles PUT requests to update an existing discharge-planning.
func (h *Handler) UpdateDischargePlanning(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateDischargePlanningRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateDischargePlanning(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
