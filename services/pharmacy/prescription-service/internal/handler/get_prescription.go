package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetPrescription handles GET requests to retrieve a single prescription by ID.
func (h *Handler) GetPrescription(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/prescriptions/")
	resp, err := h.svc.GetPrescription(r.Context(), id)
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
