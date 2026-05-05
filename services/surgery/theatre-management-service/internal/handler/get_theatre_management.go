package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetTheatreManagement handles GET requests to retrieve a single theatre-management by ID.
func (h *Handler) GetTheatreManagement(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/theatre-managements/")
	resp, err := h.svc.GetTheatreManagement(r.Context(), id)
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
