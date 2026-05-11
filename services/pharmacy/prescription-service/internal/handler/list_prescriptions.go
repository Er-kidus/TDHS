package handler

import (
	"encoding/json"
	"net/http"
)

// ListPrescriptions handles GET requests to list all prescriptions.
func (h *Handler) ListPrescriptions(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListPrescriptions(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
