package handler

import (
	"encoding/json"
	"net/http"
)

// ListStockReconciliations handles GET requests to list all stock-reconciliations.
func (h *Handler) ListStockReconciliations(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListStockReconciliations(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
