package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/insurance-eligibility-service/internal/dto"
)

// CreateInsuranceEligibility handles POST requests to create a new insurance-eligibility.
func (h *Handler) CreateInsuranceEligibility(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateInsuranceEligibilityRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateInsuranceEligibility(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
