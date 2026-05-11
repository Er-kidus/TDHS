package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/video-session-service/internal/dto"
)

// UpdateVideoSession handles PUT requests to update an existing video-session.
func (h *Handler) UpdateVideoSession(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateVideoSessionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateVideoSession(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
