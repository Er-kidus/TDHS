package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetEmergencyTriageProtocol handles GET requests to retrieve a single emergency-triage-protocol by ID.
func (h *Handler) GetEmergencyTriageProtocol(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/emergency-triage-protocols/")
	resp, err := h.svc.GetEmergencyTriageProtocol(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if resp == nil {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
