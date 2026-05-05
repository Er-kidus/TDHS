package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/audit-analytics-service/internal/dto"
)

// CreateAuditAnalytics handles POST requests to create a new audit-analytics.
func (h *Handler) CreateAuditAnalytics(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateAuditAnalyticsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateAuditAnalytics(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
