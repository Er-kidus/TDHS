package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetAsset handles GET requests to retrieve a single asset by ID.
func (h *Handler) GetAsset(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/assets/")
	resp, err := h.svc.GetAsset(r.Context(), id)
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
