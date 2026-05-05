package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/revenue-cycle-service/internal/dto"
)

// CreateRevenueCycle handles POST requests to create a new revenue-cycle.
func (h *Handler) CreateRevenueCycle(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateRevenueCycleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateRevenueCycle(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
