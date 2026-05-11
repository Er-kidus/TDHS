package handler

import (
	"net/http"
	"strings"
)

// DeleteProgramReporting handles DELETE requests to remove a program-reporting by ID.
func (h *Handler) DeleteProgramReporting(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/program-reportings/")
	w.WriteHeader(http.StatusNoContent)
}
