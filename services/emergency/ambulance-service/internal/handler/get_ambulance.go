package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetAmbulance handles GET requests to retrieve a single ambulance by ID.
func (h *Handler) GetAmbulance(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/ambulances/")
	resp, err := h.svc.GetAmbulance(r.Context(), id)
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
