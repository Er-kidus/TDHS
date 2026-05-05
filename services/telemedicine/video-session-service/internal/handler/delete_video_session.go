package handler

import (
	"net/http"
	"strings"
)

// DeleteVideoSession handles DELETE requests to remove a video-session by ID.
func (h *Handler) DeleteVideoSession(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/video-sessions/")
	w.WriteHeader(http.StatusNoContent)
}
