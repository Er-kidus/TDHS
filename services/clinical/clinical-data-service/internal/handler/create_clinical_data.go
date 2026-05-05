package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/clinical-data-service/internal/dto"
)

// CreateClinicalData handles POST requests to create a new clinical-data.
func (h *Handler) CreateClinicalData(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateClinicalDataRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateClinicalData(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
