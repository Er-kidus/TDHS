package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/integration-job-service/internal/dto"
)

// CreateIntegrationJob handles POST requests to create a new integration-job.
func (h *Handler) CreateIntegrationJob(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateIntegrationJobRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateIntegrationJob(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
