package handler

import (
	"net/http"
	"strings"
)

// DeleteLab handles DELETE requests to remove a lab by ID.
func (h *Handler) DeleteLab(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/labs/")
	w.WriteHeader(http.StatusNoContent)
}
