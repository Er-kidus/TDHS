package handler

import (
	"encoding/json"
	"net/http"
)

// ListAssets handles GET requests to list all assets.
func (h *Handler) ListAssets(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListAssets(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
