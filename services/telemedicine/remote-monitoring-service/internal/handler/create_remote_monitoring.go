package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/remote-monitoring-service/internal/dto"
)

// CreateRemoteMonitoring handles POST requests to create a new remote-monitoring.
func (h *Handler) CreateRemoteMonitoring(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateRemoteMonitoringRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateRemoteMonitoring(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
