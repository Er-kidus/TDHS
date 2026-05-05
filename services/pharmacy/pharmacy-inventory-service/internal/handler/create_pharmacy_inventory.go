package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/pharmacy-inventory-service/internal/dto"
)

// CreatePharmacyInventory handles POST requests to create a new pharmacy-inventory.
func (h *Handler) CreatePharmacyInventory(w http.ResponseWriter, r *http.Request) {
	var req dto.CreatePharmacyInventoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreatePharmacyInventory(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
