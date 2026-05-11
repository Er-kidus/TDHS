package handler

import (
	"encoding/json"
	"net/http"
)

// ListNursingDashboards handles GET requests to list all nursing-dashboards.
func (h *Handler) ListNursingDashboards(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListNursingDashboards(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
