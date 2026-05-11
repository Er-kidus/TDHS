package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/organization-service/internal/dto"
)

// CreateOrganization handles POST requests to create a new organization.
func (h *Handler) CreateOrganization(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateOrganizationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateOrganization(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
