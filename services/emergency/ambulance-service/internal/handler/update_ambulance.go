package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/ambulance-service/internal/dto"
)

// UpdateAmbulance handles PUT requests to update an existing ambulance.
func (h *Handler) UpdateAmbulance(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateAmbulanceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateAmbulance(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
