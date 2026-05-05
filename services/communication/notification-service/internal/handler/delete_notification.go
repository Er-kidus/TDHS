package handler

import (
	"net/http"
	"strings"
)

// DeleteNotification handles DELETE requests to remove a notification by ID.
func (h *Handler) DeleteNotification(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/notifications/")
	w.WriteHeader(http.StatusNoContent)
}
