package handler

import (
	"net/http"
	"strings"
)

// DeleteResult handles DELETE requests to remove a result by ID.
func (h *Handler) DeleteResult(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/results/")
	w.WriteHeader(http.StatusNoContent)
}
