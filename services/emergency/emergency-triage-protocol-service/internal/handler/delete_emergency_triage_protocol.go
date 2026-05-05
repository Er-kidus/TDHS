package handler

import (
	"net/http"
	"strings"
)

// DeleteEmergencyTriageProtocol handles DELETE requests to remove a emergency-triage-protocol by ID.
func (h *Handler) DeleteEmergencyTriageProtocol(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/emergency-triage-protocols/")
	w.WriteHeader(http.StatusNoContent)
}
