package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/discharge-planning-service/internal/dto"
)

// CreateDischargePlanning handles POST requests to create a new discharge-planning.
func (h *Handler) CreateDischargePlanning(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateDischargePlanningRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateDischargePlanning(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
