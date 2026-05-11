package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetCheckIn handles GET requests to retrieve a single check-in by ID.
func (h *Handler) GetCheckIn(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/check-ins/")
	resp, err := h.svc.GetCheckIn(r.Context(), id)
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
