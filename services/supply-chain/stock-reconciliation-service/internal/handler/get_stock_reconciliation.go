package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetStockReconciliation handles GET requests to retrieve a single stock-reconciliation by ID.
func (h *Handler) GetStockReconciliation(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/stock-reconciliations/")
	resp, err := h.svc.GetStockReconciliation(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if resp == nil {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
