package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/drug-formulary-service/internal/dto"
)

// CreateDrugFormulary handles POST requests to create a new drug-formulary.
func (h *Handler) CreateDrugFormulary(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateDrugFormularyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateDrugFormulary(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
