package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/warehouse-service/internal/dto"
)

// UpdateWarehouse handles PUT requests to update an existing warehouse.
func (h *Handler) UpdateWarehouse(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateWarehouseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateWarehouse(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
