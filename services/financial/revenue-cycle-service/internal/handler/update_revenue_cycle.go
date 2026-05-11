package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/revenue-cycle-service/internal/dto"
)

// UpdateRevenueCycle handles PUT requests to update an existing revenue-cycle.
func (h *Handler) UpdateRevenueCycle(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateRevenueCycleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateRevenueCycle(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
