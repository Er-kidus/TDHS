package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/bed-management-service/internal/dto"
)

// UpdateBedManagement handles PUT requests to update an existing bed-management.
func (h *Handler) UpdateBedManagement(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateBedManagementRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateBedManagement(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
