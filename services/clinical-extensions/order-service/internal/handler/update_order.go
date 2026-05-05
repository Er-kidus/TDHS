package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/order-service/internal/dto"
)

// UpdateOrder handles PUT requests to update an existing order.
func (h *Handler) UpdateOrder(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateOrderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateOrder(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
