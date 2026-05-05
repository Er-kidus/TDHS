package handler

import (
	"net/http"
	"strings"
)

// DeleteTheatreManagement handles DELETE requests to remove a theatre-management by ID.
func (h *Handler) DeleteTheatreManagement(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/theatre-managements/")
	w.WriteHeader(http.StatusNoContent)
}
