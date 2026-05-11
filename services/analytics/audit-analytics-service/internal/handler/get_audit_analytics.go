package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetAuditAnalytics handles GET requests to retrieve a single audit-analytics by ID.
func (h *Handler) GetAuditAnalytics(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/audit-analyticss/")
	resp, err := h.svc.GetAuditAnalytics(r.Context(), id)
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
