package handler

import (
	"encoding/json"
	"net/http"
)

// ListOutbreakDetections handles GET requests to list all outbreak-detections.
func (h *Handler) ListOutbreakDetections(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListOutbreakDetections(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
