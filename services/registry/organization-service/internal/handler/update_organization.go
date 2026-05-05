package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/organization-service/internal/dto"
)

// UpdateOrganization handles PUT requests to update an existing organization.
func (h *Handler) UpdateOrganization(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateOrganizationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateOrganization(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
