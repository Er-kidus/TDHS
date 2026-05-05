package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetOrder handles GET requests to retrieve a single order by ID.
func (h *Handler) GetOrder(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/orders/")
	resp, err := h.svc.GetOrder(r.Context(), id)
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
