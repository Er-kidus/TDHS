package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/patient-service/internal/dto"
)

// CreatePatient handles POST requests to create a new patient.
func (h *Handler) CreatePatient(w http.ResponseWriter, r *http.Request) {
	var req dto.CreatePatientRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreatePatient(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
