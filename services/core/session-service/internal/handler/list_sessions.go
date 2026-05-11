package handler

import (
	"encoding/json"
	"net/http"
)

// ListSessions handles GET requests to list all sessions.
func (h *Handler) ListSessions(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListSessions(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
