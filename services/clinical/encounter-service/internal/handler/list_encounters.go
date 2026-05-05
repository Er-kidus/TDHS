package handler

import (
	"encoding/json"
	"net/http"
)

// ListEncounters handles GET requests to list all encounters.
func (h *Handler) ListEncounters(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListEncounters(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
