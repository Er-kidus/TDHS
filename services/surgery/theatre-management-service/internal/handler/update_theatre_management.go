package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/theatre-management-service/internal/dto"
)

// UpdateTheatreManagement handles PUT requests to update an existing theatre-management.
func (h *Handler) UpdateTheatreManagement(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateTheatreManagementRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateTheatreManagement(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
