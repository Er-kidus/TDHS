package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetNursingDashboard handles GET requests to retrieve a single nursing-dashboard by ID.
func (h *Handler) GetNursingDashboard(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/nursing-dashboards/")
	resp, err := h.svc.GetNursingDashboard(r.Context(), id)
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
