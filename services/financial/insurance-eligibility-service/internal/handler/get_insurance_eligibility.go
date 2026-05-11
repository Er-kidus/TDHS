package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetInsuranceEligibility handles GET requests to retrieve a single insurance-eligibility by ID.
func (h *Handler) GetInsuranceEligibility(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/insurance-eligibilitys/")
	resp, err := h.svc.GetInsuranceEligibility(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if resp == nil {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
