package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetVoiceTts handles GET requests to retrieve a single voice-tts by ID.
func (h *Handler) GetVoiceTts(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/voice-ttss/")
	resp, err := h.svc.GetVoiceTts(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if resp == nil {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
