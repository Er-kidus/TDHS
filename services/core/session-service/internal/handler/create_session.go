package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/session-service/internal/dto"
)

// CreateSession handles POST requests to create a new session.
func (h *Handler) CreateSession(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateSessionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateSession(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
