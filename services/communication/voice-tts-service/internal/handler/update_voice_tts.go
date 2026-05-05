package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/voice-tts-service/internal/dto"
)

// UpdateVoiceTts handles PUT requests to update an existing voice-tts.
func (h *Handler) UpdateVoiceTts(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateVoiceTtsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateVoiceTts(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
