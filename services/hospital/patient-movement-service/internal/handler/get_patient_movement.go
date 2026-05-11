package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetPatientMovement handles GET requests to retrieve a single patient-movement by ID.
func (h *Handler) GetPatientMovement(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/patient-movements/")
	resp, err := h.svc.GetPatientMovement(r.Context(), id)
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
