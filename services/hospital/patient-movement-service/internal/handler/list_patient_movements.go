package handler

import (
	"encoding/json"
	"net/http"
)

// ListPatientMovements handles GET requests to list all patient-movements.
func (h *Handler) ListPatientMovements(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListPatientMovements(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
