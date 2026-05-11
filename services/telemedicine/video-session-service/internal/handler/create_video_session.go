package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/video-session-service/internal/dto"
)

// CreateVideoSession handles POST requests to create a new video-session.
func (h *Handler) CreateVideoSession(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateVideoSessionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateVideoSession(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
