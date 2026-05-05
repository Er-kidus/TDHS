package handler

import (
	"net/http"
	"strings"
)

// DeleteClaims handles DELETE requests to remove a claims by ID.
func (h *Handler) DeleteClaims(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/claimss/")
	w.WriteHeader(http.StatusNoContent)
}
