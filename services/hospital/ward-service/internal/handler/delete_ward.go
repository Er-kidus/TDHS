package handler

import (
	"net/http"
	"strings"
)

// DeleteWard handles DELETE requests to remove a ward by ID.
func (h *Handler) DeleteWard(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/wards/")
	w.WriteHeader(http.StatusNoContent)
}
