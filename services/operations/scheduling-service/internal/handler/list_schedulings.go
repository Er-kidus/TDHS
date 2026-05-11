package handler

import (
	"encoding/json"
	"net/http"
)

// ListSchedulings handles GET requests to list all schedulings.
func (h *Handler) ListSchedulings(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListSchedulings(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
