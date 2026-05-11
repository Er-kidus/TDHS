package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/lab-workflow-service/internal/dto"
)

// CreateLabWorkflow handles POST requests to create a new lab-workflow.
func (h *Handler) CreateLabWorkflow(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateLabWorkflowRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateLabWorkflow(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
