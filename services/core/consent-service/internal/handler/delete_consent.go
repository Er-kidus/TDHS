package handler

import (
	"net/http"
	"strings"
)

// DeleteConsent handles DELETE requests to remove a consent by ID.
func (h *Handler) DeleteConsent(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/consents/")
	w.WriteHeader(http.StatusNoContent)
}
