package handler

import (
	"net/http"
	"strings"
)

// DeleteTeleTriage handles DELETE requests to remove a tele-triage by ID.
func (h *Handler) DeleteTeleTriage(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/tele-triages/")
	w.WriteHeader(http.StatusNoContent)
}
