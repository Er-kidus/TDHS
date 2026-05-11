package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/analytics-service/internal/dto"
)

// CreateAnalytics handles POST requests to create a new analytics.
func (h *Handler) CreateAnalytics(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateAnalyticsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateAnalytics(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
