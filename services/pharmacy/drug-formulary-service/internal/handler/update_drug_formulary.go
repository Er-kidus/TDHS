package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/drug-formulary-service/internal/dto"
)

// UpdateDrugFormulary handles PUT requests to update an existing drug-formulary.
func (h *Handler) UpdateDrugFormulary(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateDrugFormularyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateDrugFormulary(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
