package handler

import (
	"encoding/json"
	"net/http"
)

// ListAuditAnalyticss handles GET requests to list all audit-analyticss.
func (h *Handler) ListAuditAnalyticss(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListAuditAnalyticss(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
