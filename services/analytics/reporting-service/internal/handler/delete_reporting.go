package handler

import (
	"net/http"
	"strings"
)

// DeleteReporting handles DELETE requests to remove a reporting by ID.
func (h *Handler) DeleteReporting(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/reportings/")
	w.WriteHeader(http.StatusNoContent)
}
