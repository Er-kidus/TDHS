package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/telemedicine-service/internal/dto"
)

// UpdateTelemedicine handles PUT requests to update an existing telemedicine.
func (h *Handler) UpdateTelemedicine(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateTelemedicineRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateTelemedicine(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
