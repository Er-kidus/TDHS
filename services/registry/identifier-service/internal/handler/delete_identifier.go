package handler

import (
	"net/http"
	"strings"
)

// DeleteIdentifier handles DELETE requests to remove a identifier by ID.
func (h *Handler) DeleteIdentifier(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/identifiers/")
	w.WriteHeader(http.StatusNoContent)
}
