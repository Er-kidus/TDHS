package handler

import (
	"encoding/json"
	"net/http"
)

// ListWarehouses handles GET requests to list all warehouses.
func (h *Handler) ListWarehouses(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListWarehouses(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
