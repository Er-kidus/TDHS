package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/radiology-workflow-service/internal/dto"
)

// UpdateRadiologyWorkflow handles PUT requests to update an existing radiology-workflow.
func (h *Handler) UpdateRadiologyWorkflow(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateRadiologyWorkflowRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateRadiologyWorkflow(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
