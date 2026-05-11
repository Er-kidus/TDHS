package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetSurgery handles GET requests to retrieve a single surgery by ID.
func (h *Handler) GetSurgery(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/surgerys/")
	resp, err := h.svc.GetSurgery(r.Context(), id)
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
