package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/shift-handoff-service/internal/dto"
)

// CreateShiftHandoff handles POST requests to create a new shift-handoff.
func (h *Handler) CreateShiftHandoff(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateShiftHandoffRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateShiftHandoff(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
