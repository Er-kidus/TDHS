package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/specimen-service/internal/dto"
)

// UpdateSpecimen handles PUT requests to update an existing specimen.
func (h *Handler) UpdateSpecimen(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateSpecimenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateSpecimen(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
