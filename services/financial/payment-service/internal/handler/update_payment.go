package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/payment-service/internal/dto"
)

// UpdatePayment handles PUT requests to update an existing payment.
func (h *Handler) UpdatePayment(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdatePaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdatePayment(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
