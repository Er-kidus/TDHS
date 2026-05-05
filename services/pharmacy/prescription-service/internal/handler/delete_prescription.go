package handler

import (
	"net/http"
	"strings"
)

// DeletePrescription handles DELETE requests to remove a prescription by ID.
func (h *Handler) DeletePrescription(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/prescriptions/")
	w.WriteHeader(http.StatusNoContent)
}
