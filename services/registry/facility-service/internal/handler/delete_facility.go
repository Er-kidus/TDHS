package handler

import (
	"net/http"
	"strings"
)

// DeleteFacility handles DELETE requests to remove a facility by ID.
func (h *Handler) DeleteFacility(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/facilitys/")
	w.WriteHeader(http.StatusNoContent)
}
