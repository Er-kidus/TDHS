package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/surgery-scheduling-service/internal/dto"
)

// CreateSurgeryScheduling handles POST requests to create a new surgery-scheduling.
func (h *Handler) CreateSurgeryScheduling(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateSurgerySchedulingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateSurgeryScheduling(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
