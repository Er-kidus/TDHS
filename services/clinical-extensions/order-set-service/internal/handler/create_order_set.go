package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/order-set-service/internal/dto"
)

// CreateOrderSet handles POST requests to create a new order-set.
func (h *Handler) CreateOrderSet(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateOrderSetRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateOrderSet(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
