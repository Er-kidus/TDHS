package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetRevenueCycle handles GET requests to retrieve a single revenue-cycle by ID.
func (h *Handler) GetRevenueCycle(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/revenue-cycles/")
	resp, err := h.svc.GetRevenueCycle(r.Context(), id)
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
