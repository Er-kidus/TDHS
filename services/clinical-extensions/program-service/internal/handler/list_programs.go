package handler

import (
	"encoding/json"
	"net/http"
)

// ListPrograms handles GET requests to list all programs.
func (h *Handler) ListPrograms(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListPrograms(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
