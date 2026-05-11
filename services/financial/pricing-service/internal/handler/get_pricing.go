package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetPricing handles GET requests to retrieve a single pricing by ID.
func (h *Handler) GetPricing(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/pricings/")
	resp, err := h.svc.GetPricing(r.Context(), id)
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
