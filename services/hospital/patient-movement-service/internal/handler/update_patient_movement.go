package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/patient-movement-service/internal/dto"
)

// UpdatePatientMovement handles PUT requests to update an existing patient-movement.
func (h *Handler) UpdatePatientMovement(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdatePatientMovementRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdatePatientMovement(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
