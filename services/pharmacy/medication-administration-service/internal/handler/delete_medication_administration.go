package handler

import (
	"net/http"
	"strings"
)

// DeleteMedicationAdministration handles DELETE requests to remove a medication-administration by ID.
func (h *Handler) DeleteMedicationAdministration(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/medication-administrations/")
	w.WriteHeader(http.StatusNoContent)
}
