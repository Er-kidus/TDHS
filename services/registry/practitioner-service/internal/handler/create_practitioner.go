package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/practitioner-service/internal/dto"
)

// CreatePractitioner handles POST requests to create a new practitioner.
func (h *Handler) CreatePractitioner(w http.ResponseWriter, r *http.Request) {
	var req dto.CreatePractitionerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreatePractitioner(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
