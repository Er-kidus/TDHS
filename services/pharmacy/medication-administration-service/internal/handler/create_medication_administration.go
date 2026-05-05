package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/medication-administration-service/internal/dto"
)

// CreateMedicationAdministration handles POST requests to create a new medication-administration.
func (h *Handler) CreateMedicationAdministration(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateMedicationAdministrationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateMedicationAdministration(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
