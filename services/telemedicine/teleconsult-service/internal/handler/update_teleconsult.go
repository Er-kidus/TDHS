package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/teleconsult-service/internal/dto"
)

// UpdateTeleconsult handles PUT requests to update an existing teleconsult.
func (h *Handler) UpdateTeleconsult(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateTeleconsultRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateTeleconsult(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
