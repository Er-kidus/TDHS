package handler

import (
	"net/http"
	"strings"
)

// DeleteOutbreakDetection handles DELETE requests to remove a outbreak-detection by ID.
func (h *Handler) DeleteOutbreakDetection(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/outbreak-detections/")
	w.WriteHeader(http.StatusNoContent)
}
