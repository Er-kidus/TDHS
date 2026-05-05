package handler

import (
	"encoding/json"
	"net/http"
)

// ListDashboards handles GET requests to list all dashboards.
func (h *Handler) ListDashboards(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListDashboards(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
