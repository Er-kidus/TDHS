package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetInventory handles GET requests to retrieve a single inventory by ID.
func (h *Handler) GetInventory(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/inventorys/")
	resp, err := h.svc.GetInventory(r.Context(), id)
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
