package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/auth-service/internal/dto"
)

// CreateAuth handles POST requests to create a new auth.
func (h *Handler) CreateAuth(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateAuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateAuth(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
