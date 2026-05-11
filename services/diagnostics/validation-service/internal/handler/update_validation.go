package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/validation-service/internal/dto"
)

// UpdateValidation handles PUT requests to update an existing validation.
func (h *Handler) UpdateValidation(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateValidationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateValidation(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
