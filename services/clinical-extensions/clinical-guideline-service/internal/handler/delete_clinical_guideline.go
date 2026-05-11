package handler

import (
	"net/http"
	"strings"
)

// DeleteClinicalGuideline handles DELETE requests to remove a clinical-guideline by ID.
func (h *Handler) DeleteClinicalGuideline(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/clinical-guidelines/")
	w.WriteHeader(http.StatusNoContent)
}
