package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetDashboard handles GET requests to retrieve a single dashboard by ID.
func (h *Handler) GetDashboard(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/dashboards/")
	resp, err := h.svc.GetDashboard(r.Context(), id)
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
