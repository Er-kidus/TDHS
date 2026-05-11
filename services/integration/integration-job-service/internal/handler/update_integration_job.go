package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/integration-job-service/internal/dto"
)

// UpdateIntegrationJob handles PUT requests to update an existing integration-job.
func (h *Handler) UpdateIntegrationJob(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateIntegrationJobRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateIntegrationJob(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
