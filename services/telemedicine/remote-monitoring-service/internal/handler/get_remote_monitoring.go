package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetRemoteMonitoring handles GET requests to retrieve a single remote-monitoring by ID.
func (h *Handler) GetRemoteMonitoring(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/remote-monitorings/")
	resp, err := h.svc.GetRemoteMonitoring(r.Context(), id)
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
