package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/check-in-service/internal/dto"
)

// CreateCheckIn handles POST requests to create a new check-in.
func (h *Handler) CreateCheckIn(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateCheckInRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateCheckIn(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
