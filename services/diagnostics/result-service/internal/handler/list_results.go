package handler

import (
	"encoding/json"
	"net/http"
)

// ListResults handles GET requests to list all results.
func (h *Handler) ListResults(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListResults(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
