package handler

import (
	"encoding/json"
	"net/http"
)

// ListAmbulances handles GET requests to list all ambulances.
func (h *Handler) ListAmbulances(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListAmbulances(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
