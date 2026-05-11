package handler

import (
	"net/http"
	"strings"
)

// DeletePatient handles DELETE requests to remove a patient by ID.
func (h *Handler) DeletePatient(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/patients/")
	w.WriteHeader(http.StatusNoContent)
}
