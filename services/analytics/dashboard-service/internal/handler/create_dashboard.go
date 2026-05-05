package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/dashboard-service/internal/dto"
)

// CreateDashboard handles POST requests to create a new dashboard.
func (h *Handler) CreateDashboard(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateDashboardRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateDashboard(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
