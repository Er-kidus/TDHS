package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/order-set-service/internal/dto"
)

// UpdateOrderSet handles PUT requests to update an existing order-set.
func (h *Handler) UpdateOrderSet(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateOrderSetRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateOrderSet(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
