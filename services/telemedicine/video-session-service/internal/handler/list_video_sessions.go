package handler

import (
	"encoding/json"
	"net/http"
)

// ListVideoSessions handles GET requests to list all video-sessions.
func (h *Handler) ListVideoSessions(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListVideoSessions(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
