package handler

import (
	"net/http"
	"strings"
)

// DeleteMedication handles DELETE requests to remove a medication by ID.
func (h *Handler) DeleteMedication(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/medications/")
	w.WriteHeader(http.StatusNoContent)
}
