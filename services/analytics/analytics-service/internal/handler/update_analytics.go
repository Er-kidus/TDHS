package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/analytics-service/internal/dto"
)

// UpdateAnalytics handles PUT requests to update an existing analytics.
func (h *Handler) UpdateAnalytics(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateAnalyticsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateAnalytics(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
