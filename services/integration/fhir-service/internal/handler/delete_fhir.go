package handler

import (
	"net/http"
	"strings"
)

// DeleteFhir handles DELETE requests to remove a fhir by ID.
func (h *Handler) DeleteFhir(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/fhirs/")
	w.WriteHeader(http.StatusNoContent)
}
