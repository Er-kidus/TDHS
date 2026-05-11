package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/nursing-dashboard-service/internal/dto"
)

// CreateNursingDashboard handles POST requests to create a new nursing-dashboard.
func (h *Handler) CreateNursingDashboard(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateNursingDashboardRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateNursingDashboard(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
