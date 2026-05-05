package handler

import (
	"encoding/json"
	"net/http"
)

// ListRevenueCycles handles GET requests to list all revenue-cycles.
func (h *Handler) ListRevenueCycles(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListRevenueCycles(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
