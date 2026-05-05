package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/emergency-triage-protocol-service/internal/dto"
)

// CreateEmergencyTriageProtocol handles POST requests to create a new emergency-triage-protocol.
func (h *Handler) CreateEmergencyTriageProtocol(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateEmergencyTriageProtocolRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateEmergencyTriageProtocol(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
