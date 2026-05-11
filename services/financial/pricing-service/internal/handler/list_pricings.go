package handler

import (
	"encoding/json"
	"net/http"
)

// ListPricings handles GET requests to list all pricings.
func (h *Handler) ListPricings(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListPricings(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
