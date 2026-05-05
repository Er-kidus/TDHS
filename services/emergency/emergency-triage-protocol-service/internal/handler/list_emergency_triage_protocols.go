package handler

import (
	"encoding/json"
	"net/http"
)

// ListEmergencyTriageProtocols handles GET requests to list all emergency-triage-protocols.
func (h *Handler) ListEmergencyTriageProtocols(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListEmergencyTriageProtocols(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
