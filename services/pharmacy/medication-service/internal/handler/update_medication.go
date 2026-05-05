package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/medication-service/internal/dto"
)

// UpdateMedication handles PUT requests to update an existing medication.
func (h *Handler) UpdateMedication(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateMedicationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateMedication(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
