package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/medication-service/internal/dto"
)

// CreateMedication handles POST requests to create a new medication.
func (h *Handler) CreateMedication(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateMedicationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateMedication(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
