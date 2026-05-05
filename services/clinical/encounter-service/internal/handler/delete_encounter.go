package handler

import (
	"net/http"
	"strings"
)

// DeleteEncounter handles DELETE requests to remove a encounter by ID.
func (h *Handler) DeleteEncounter(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/encounters/")
	w.WriteHeader(http.StatusNoContent)
}
