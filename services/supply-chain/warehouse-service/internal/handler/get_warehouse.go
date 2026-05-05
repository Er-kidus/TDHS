package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetWarehouse handles GET requests to retrieve a single warehouse by ID.
func (h *Handler) GetWarehouse(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/warehouses/")
	resp, err := h.svc.GetWarehouse(r.Context(), id)
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
