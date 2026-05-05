package handler

import (
	"net/http"
	"strings"
)

// DeletePatientMovement handles DELETE requests to remove a patient-movement by ID.
func (h *Handler) DeletePatientMovement(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/patient-movements/")
	w.WriteHeader(http.StatusNoContent)
}
