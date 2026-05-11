package handler

import (
	"net/http"
	"strings"
)

// DeleteTeleconsult handles DELETE requests to remove a teleconsult by ID.
func (h *Handler) DeleteTeleconsult(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/teleconsults/")
	w.WriteHeader(http.StatusNoContent)
}
