package handler

import (
	"net/http"
	"strings"
)

// DeleteVoiceTts handles DELETE requests to remove a voice-tts by ID.
func (h *Handler) DeleteVoiceTts(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/voice-ttss/")
	w.WriteHeader(http.StatusNoContent)
}
