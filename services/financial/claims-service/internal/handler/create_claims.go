package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/claims-service/internal/dto"
)

// CreateClaims handles POST requests to create a new claims.
func (h *Handler) CreateClaims(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateClaimsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateClaims(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
