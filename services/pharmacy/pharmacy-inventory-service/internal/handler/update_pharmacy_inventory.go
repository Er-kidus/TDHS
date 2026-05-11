package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/pharmacy-inventory-service/internal/dto"
)

// UpdatePharmacyInventory handles PUT requests to update an existing pharmacy-inventory.
func (h *Handler) UpdatePharmacyInventory(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdatePharmacyInventoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdatePharmacyInventory(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
