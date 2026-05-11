package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/theatre-management-service/internal/dto"
)

// CreateTheatreManagement handles POST requests to create a new theatre-management.
func (h *Handler) CreateTheatreManagement(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateTheatreManagementRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateTheatreManagement(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
