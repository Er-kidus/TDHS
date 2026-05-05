package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/audit-analytics-service/internal/dto"
)

// UpdateAuditAnalytics handles PUT requests to update an existing audit-analytics.
func (h *Handler) UpdateAuditAnalytics(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateAuditAnalyticsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateAuditAnalytics(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
