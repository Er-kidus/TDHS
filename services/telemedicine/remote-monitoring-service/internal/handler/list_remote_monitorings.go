package handler

import (
	"encoding/json"
	"net/http"
)

// ListRemoteMonitorings handles GET requests to list all remote-monitorings.
func (h *Handler) ListRemoteMonitorings(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListRemoteMonitorings(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
