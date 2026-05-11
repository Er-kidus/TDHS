package handler

import (
	"encoding/json"
	"net/http"
)

// ListInsuranceEligibilitys handles GET requests to list all insurance-eligibilitys.
func (h *Handler) ListInsuranceEligibilitys(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListInsuranceEligibilitys(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
