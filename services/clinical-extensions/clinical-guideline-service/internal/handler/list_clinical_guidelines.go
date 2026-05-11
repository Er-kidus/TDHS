package handler

import (
	"encoding/json"
	"net/http"
)

// ListClinicalGuidelines handles GET requests to list all clinical-guidelines.
func (h *Handler) ListClinicalGuidelines(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListClinicalGuidelines(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
