package handler

import (
	"net/http"
	"strings"
)

// DeleteQueue handles DELETE requests to remove a queue by ID.
func (h *Handler) DeleteQueue(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/queues/")
	w.WriteHeader(http.StatusNoContent)
}
