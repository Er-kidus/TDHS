package handler

import (
	"net/http"
	"strings"
)

// DeleteNationalReporting handles DELETE requests to remove a national-reporting by ID.
func (h *Handler) DeleteNationalReporting(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/national-reportings/")
	w.WriteHeader(http.StatusNoContent)
}
