package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/patient-service/internal/dto"
)

// UpdatePatient handles PUT requests to update an existing patient.
func (h *Handler) UpdatePatient(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdatePatientRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdatePatient(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
