package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/radiology-workflow-service/internal/dto"
)

// CreateRadiologyWorkflow handles POST requests to create a new radiology-workflow.
func (h *Handler) CreateRadiologyWorkflow(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateRadiologyWorkflowRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateRadiologyWorkflow(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
