package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/payment-service/internal/dto"
)

// CreatePayment handles POST requests to create a new payment.
func (h *Handler) CreatePayment(w http.ResponseWriter, r *http.Request) {
	var req dto.CreatePaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreatePayment(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
