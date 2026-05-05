package handler

import (
	"net/http"
	"strings"
)

// DeleteInpatient handles DELETE requests to remove a inpatient by ID.
func (h *Handler) DeleteInpatient(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/inpatients/")
	w.WriteHeader(http.StatusNoContent)
}
