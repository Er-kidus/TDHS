package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetTeleconsult handles GET requests to retrieve a single teleconsult by ID.
func (h *Handler) GetTeleconsult(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/teleconsults/")
	resp, err := h.svc.GetTeleconsult(r.Context(), id)
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
