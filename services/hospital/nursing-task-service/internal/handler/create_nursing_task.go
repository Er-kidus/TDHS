package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/nursing-task-service/internal/dto"
)

// CreateNursingTask handles POST requests to create a new nursing-task.
func (h *Handler) CreateNursingTask(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateNursingTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateNursingTask(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
