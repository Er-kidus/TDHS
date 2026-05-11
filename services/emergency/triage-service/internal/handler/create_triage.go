package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/triage-service/internal/dto"
)

// CreateTriage handles POST requests to create a new triage.
func (h *Handler) CreateTriage(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateTriageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateTriage(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
