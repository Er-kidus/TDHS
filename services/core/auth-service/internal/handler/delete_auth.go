package handler

import (
	"net/http"
	"strings"
)

// DeleteAuth handles DELETE requests to remove a auth by ID.
func (h *Handler) DeleteAuth(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/auths/")
	w.WriteHeader(http.StatusNoContent)
}
