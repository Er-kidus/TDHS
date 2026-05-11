package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/telemedicine-service/internal/dto"
)

// CreateTelemedicine handles POST requests to create a new telemedicine.
func (h *Handler) CreateTelemedicine(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateTelemedicineRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateTelemedicine(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
