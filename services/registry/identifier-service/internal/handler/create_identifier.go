package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/identifier-service/internal/dto"
)

// CreateIdentifier handles POST requests to create a new identifier.
func (h *Handler) CreateIdentifier(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateIdentifierRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateIdentifier(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
