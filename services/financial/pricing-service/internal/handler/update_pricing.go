package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/pricing-service/internal/dto"
)

// UpdatePricing handles PUT requests to update an existing pricing.
func (h *Handler) UpdatePricing(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdatePricingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdatePricing(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
