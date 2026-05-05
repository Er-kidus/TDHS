package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/clinical-data-service/internal/dto"
)

// UpdateClinicalData handles PUT requests to update an existing clinical-data.
func (h *Handler) UpdateClinicalData(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateClinicalDataRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateClinicalData(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
