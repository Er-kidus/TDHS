package handler

import (
	"encoding/json"
	"net/http"
)

// ListConfigurations handles GET requests to list all configurations.
func (h *Handler) ListConfigurations(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListConfigurations(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
