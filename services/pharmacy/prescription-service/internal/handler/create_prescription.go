package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/prescription-service/internal/dto"
)

// CreatePrescription handles POST requests to create a new prescription.
func (h *Handler) CreatePrescription(w http.ResponseWriter, r *http.Request) {
	var req dto.CreatePrescriptionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreatePrescription(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
