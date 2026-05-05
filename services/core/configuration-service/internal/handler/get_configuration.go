package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetConfiguration handles GET requests to retrieve a single configuration by ID.
func (h *Handler) GetConfiguration(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/configurations/")
	resp, err := h.svc.GetConfiguration(r.Context(), id)
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
