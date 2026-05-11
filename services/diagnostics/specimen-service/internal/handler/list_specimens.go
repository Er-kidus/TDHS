package handler

import (
	"encoding/json"
	"net/http"
)

// ListSpecimens handles GET requests to list all specimens.
func (h *Handler) ListSpecimens(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListSpecimens(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
