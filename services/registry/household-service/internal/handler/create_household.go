package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/household-service/internal/dto"
)

// CreateHousehold handles POST requests to create a new household.
func (h *Handler) CreateHousehold(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateHouseholdRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateHousehold(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
