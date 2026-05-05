package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/specimen-service/internal/dto"
)

// CreateSpecimen handles POST requests to create a new specimen.
func (h *Handler) CreateSpecimen(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateSpecimenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateSpecimen(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
