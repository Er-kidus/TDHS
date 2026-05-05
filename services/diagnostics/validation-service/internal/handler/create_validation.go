package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/validation-service/internal/dto"
)

// CreateValidation handles POST requests to create a new validation.
func (h *Handler) CreateValidation(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateValidationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateValidation(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
