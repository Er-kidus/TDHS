package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetResult handles GET requests to retrieve a single result by ID.
func (h *Handler) GetResult(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/results/")
	resp, err := h.svc.GetResult(r.Context(), id)
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
