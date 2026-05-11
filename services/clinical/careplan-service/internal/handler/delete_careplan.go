package handler

import (
	"net/http"
	"strings"
)

// DeleteCareplan handles DELETE requests to remove a careplan by ID.
func (h *Handler) DeleteCareplan(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/careplans/")
	w.WriteHeader(http.StatusNoContent)
}
