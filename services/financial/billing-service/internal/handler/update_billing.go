package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/billing-service/internal/dto"
)

// UpdateBilling handles PUT requests to update an existing billing.
func (h *Handler) UpdateBilling(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateBillingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateBilling(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
