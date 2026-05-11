package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetPatient handles GET requests to retrieve a single patient by ID.
func (h *Handler) GetPatient(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/patients/")
	resp, err := h.svc.GetPatient(r.Context(), id)
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
