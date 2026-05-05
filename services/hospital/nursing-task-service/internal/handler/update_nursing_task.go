package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/nursing-task-service/internal/dto"
)

// UpdateNursingTask handles PUT requests to update an existing nursing-task.
func (h *Handler) UpdateNursingTask(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateNursingTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateNursingTask(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
