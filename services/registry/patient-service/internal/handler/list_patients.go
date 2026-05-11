package handler

import (
	"encoding/json"
	"net/http"
)

// ListPatients handles GET requests to list all patients.
func (h *Handler) ListPatients(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListPatients(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
