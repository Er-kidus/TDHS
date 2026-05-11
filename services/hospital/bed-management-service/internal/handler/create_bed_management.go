package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/bed-management-service/internal/dto"
)

// CreateBedManagement handles POST requests to create a new bed-management.
func (h *Handler) CreateBedManagement(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateBedManagementRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateBedManagement(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
