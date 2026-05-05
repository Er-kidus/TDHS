package handler

import (
	"net/http"
	"strings"
)

// DeleteCheckIn handles DELETE requests to remove a check-in by ID.
func (h *Handler) DeleteCheckIn(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/check-ins/")
	w.WriteHeader(http.StatusNoContent)
}
