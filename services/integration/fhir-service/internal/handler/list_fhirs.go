package handler

import (
	"encoding/json"
	"net/http"
)

// ListFhirs handles GET requests to list all fhirs.
func (h *Handler) ListFhirs(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListFhirs(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
