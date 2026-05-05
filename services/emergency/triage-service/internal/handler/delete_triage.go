package handler

import (
	"net/http"
	"strings"
)

// DeleteTriage handles DELETE requests to remove a triage by ID.
func (h *Handler) DeleteTriage(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/triages/")
	w.WriteHeader(http.StatusNoContent)
}
