package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/pricing-service/internal/dto"
)

// CreatePricing handles POST requests to create a new pricing.
func (h *Handler) CreatePricing(w http.ResponseWriter, r *http.Request) {
	var req dto.CreatePricingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreatePricing(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
