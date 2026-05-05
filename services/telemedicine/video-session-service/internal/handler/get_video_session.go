package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetVideoSession handles GET requests to retrieve a single video-session by ID.
func (h *Handler) GetVideoSession(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/video-sessions/")
	resp, err := h.svc.GetVideoSession(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if resp == nil {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
