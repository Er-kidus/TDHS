package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetOrderSet handles GET requests to retrieve a single order-set by ID.
func (h *Handler) GetOrderSet(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/order-sets/")
	resp, err := h.svc.GetOrderSet(r.Context(), id)
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
