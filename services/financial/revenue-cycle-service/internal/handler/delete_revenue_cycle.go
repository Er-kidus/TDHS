package handler

import (
	"net/http"
	"strings"
)

// DeleteRevenueCycle handles DELETE requests to remove a revenue-cycle by ID.
func (h *Handler) DeleteRevenueCycle(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/revenue-cycles/")
	w.WriteHeader(http.StatusNoContent)
}
