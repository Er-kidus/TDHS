package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/remote-monitoring-service/internal/dto"
)

// UpdateRemoteMonitoring handles PUT requests to update an existing remote-monitoring.
func (h *Handler) UpdateRemoteMonitoring(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateRemoteMonitoringRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateRemoteMonitoring(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
