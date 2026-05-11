package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/insurance-eligibility-service/internal/dto"
)

// UpdateInsuranceEligibility handles PUT requests to update an existing insurance-eligibility.
func (h *Handler) UpdateInsuranceEligibility(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateInsuranceEligibilityRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateInsuranceEligibility(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
