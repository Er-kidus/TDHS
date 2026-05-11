package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/patient-movement-service/internal/dto"
)

// CreatePatientMovement handles POST requests to create a new patient-movement.
func (h *Handler) CreatePatientMovement(w http.ResponseWriter, r *http.Request) {
	var req dto.CreatePatientMovementRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreatePatientMovement(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
