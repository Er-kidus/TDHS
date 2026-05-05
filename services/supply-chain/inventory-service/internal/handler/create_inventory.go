package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/inventory-service/internal/dto"
)

// CreateInventory handles POST requests to create a new inventory.
func (h *Handler) CreateInventory(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateInventoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateInventory(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
