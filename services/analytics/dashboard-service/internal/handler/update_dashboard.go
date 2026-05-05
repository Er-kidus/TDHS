package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/dashboard-service/internal/dto"
)

// UpdateDashboard handles PUT requests to update an existing dashboard.
func (h *Handler) UpdateDashboard(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateDashboardRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateDashboard(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
