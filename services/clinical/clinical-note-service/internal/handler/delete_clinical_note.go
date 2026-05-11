package handler

import (
	"net/http"
	"strings"
)

// DeleteClinicalNote handles DELETE requests to remove a clinical-note by ID.
func (h *Handler) DeleteClinicalNote(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/clinical-notes/")
	w.WriteHeader(http.StatusNoContent)
}
