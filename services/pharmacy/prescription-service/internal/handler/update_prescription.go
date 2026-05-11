package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/prescription-service/internal/dto"
)

// UpdatePrescription handles PUT requests to update an existing prescription.
func (h *Handler) UpdatePrescription(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdatePrescriptionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdatePrescription(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
