package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetAnalytics handles GET requests to retrieve a single analytics by ID.
func (h *Handler) GetAnalytics(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/analyticss/")
	resp, err := h.svc.GetAnalytics(r.Context(), id)
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
