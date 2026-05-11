package handler

import (
	"encoding/json"
	"net/http"
)

// ListMedicationAdministrations handles GET requests to list all medication-administrations.
func (h *Handler) ListMedicationAdministrations(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListMedicationAdministrations(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
