package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/teleconsult-service/internal/dto"
)

// CreateTeleconsult handles POST requests to create a new teleconsult.
func (h *Handler) CreateTeleconsult(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateTeleconsultRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateTeleconsult(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
