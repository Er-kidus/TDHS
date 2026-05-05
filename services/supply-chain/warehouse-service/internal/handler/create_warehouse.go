package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/warehouse-service/internal/dto"
)

// CreateWarehouse handles POST requests to create a new warehouse.
func (h *Handler) CreateWarehouse(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateWarehouseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateWarehouse(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
