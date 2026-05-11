package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/household-service/internal/dto"
)

// UpdateHousehold handles PUT requests to update an existing household.
func (h *Handler) UpdateHousehold(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateHouseholdRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateHousehold(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
