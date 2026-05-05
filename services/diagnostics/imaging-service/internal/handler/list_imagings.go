package handler

import (
	"encoding/json"
	"net/http"
)

// ListImagings handles GET requests to list all imagings.
func (h *Handler) ListImagings(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListImagings(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
