package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/stock-reconciliation-service/internal/dto"
)

// UpdateStockReconciliation handles PUT requests to update an existing stock-reconciliation.
func (h *Handler) UpdateStockReconciliation(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateStockReconciliationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateStockReconciliation(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
