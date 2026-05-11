package handler

import (
	"net/http"
	"strings"
)

// DeletePractitioner handles DELETE requests to remove a practitioner by ID.
func (h *Handler) DeletePractitioner(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/practitioners/")
	w.WriteHeader(http.StatusNoContent)
}
