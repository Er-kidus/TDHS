package handler

import (
	"net/http"
	"strings"
)

// DeleteInsuranceEligibility handles DELETE requests to remove a insurance-eligibility by ID.
func (h *Handler) DeleteInsuranceEligibility(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/insurance-eligibilitys/")
	w.WriteHeader(http.StatusNoContent)
}
