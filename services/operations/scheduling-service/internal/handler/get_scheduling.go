package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetScheduling handles GET requests to retrieve a single scheduling by ID.
func (h *Handler) GetScheduling(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/schedulings/")
	resp, err := h.svc.GetScheduling(r.Context(), id)
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
