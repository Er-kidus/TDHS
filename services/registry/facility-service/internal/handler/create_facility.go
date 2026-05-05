package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/facility-service/internal/dto"
)

// CreateFacility handles POST requests to create a new facility.
func (h *Handler) CreateFacility(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateFacilityRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateFacility(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
