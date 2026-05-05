package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/claims-service/internal/dto"
)

// UpdateClaims handles PUT requests to update an existing claims.
func (h *Handler) UpdateClaims(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateClaimsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateClaims(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
