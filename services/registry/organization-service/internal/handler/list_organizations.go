package handler

import (
	"encoding/json"
	"net/http"
)

// ListOrganizations handles GET requests to list all organizations.
func (h *Handler) ListOrganizations(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListOrganizations(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
