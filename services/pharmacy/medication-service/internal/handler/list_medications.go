package handler

import (
	"encoding/json"
	"net/http"
)

// ListMedications handles GET requests to list all medications.
func (h *Handler) ListMedications(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListMedications(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
