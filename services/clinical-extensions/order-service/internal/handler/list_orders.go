package handler

import (
	"encoding/json"
	"net/http"
)

// ListOrders handles GET requests to list all orders.
func (h *Handler) ListOrders(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListOrders(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
