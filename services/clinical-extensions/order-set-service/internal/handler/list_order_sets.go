package handler

import (
	"encoding/json"
	"net/http"
)

// ListOrderSets handles GET requests to list all order-sets.
func (h *Handler) ListOrderSets(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListOrderSets(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
