package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/lab-workflow-service/internal/dto"
)

// UpdateLabWorkflow handles PUT requests to update an existing lab-workflow.
func (h *Handler) UpdateLabWorkflow(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateLabWorkflowRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateLabWorkflow(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
