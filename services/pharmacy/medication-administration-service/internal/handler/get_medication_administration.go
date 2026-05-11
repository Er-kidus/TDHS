package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetMedicationAdministration handles GET requests to retrieve a single medication-administration by ID.
func (h *Handler) GetMedicationAdministration(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/medication-administrations/")
	resp, err := h.svc.GetMedicationAdministration(r.Context(), id)
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
