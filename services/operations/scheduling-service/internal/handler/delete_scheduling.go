package handler

import (
	"net/http"
	"strings"
)

// DeleteScheduling handles DELETE requests to remove a scheduling by ID.
func (h *Handler) DeleteScheduling(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/schedulings/")
	w.WriteHeader(http.StatusNoContent)
}
