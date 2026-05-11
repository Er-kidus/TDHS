package handler

import (
	"encoding/json"
	"net/http"
)

// ListNursings handles GET requests to list all nursings.
func (h *Handler) ListNursings(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListNursings(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
