package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/scheduling-service/internal/dto"
)

// CreateScheduling handles POST requests to create a new scheduling.
func (h *Handler) CreateScheduling(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateSchedulingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateScheduling(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
