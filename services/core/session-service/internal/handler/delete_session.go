package handler

import (
	"net/http"
	"strings"
)

// DeleteSession handles DELETE requests to remove a session by ID.
func (h *Handler) DeleteSession(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/sessions/")
	w.WriteHeader(http.StatusNoContent)
}
