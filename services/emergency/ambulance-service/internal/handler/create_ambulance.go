package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/ambulance-service/internal/dto"
)

// CreateAmbulance handles POST requests to create a new ambulance.
func (h *Handler) CreateAmbulance(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateAmbulanceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateAmbulance(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
