package handler

import (
	"encoding/json"
	"net/http"
)

// ListVoiceTtss handles GET requests to list all voice-ttss.
func (h *Handler) ListVoiceTtss(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListVoiceTtss(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
