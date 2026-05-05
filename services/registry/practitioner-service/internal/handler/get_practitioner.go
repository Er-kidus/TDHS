package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetPractitioner handles GET requests to retrieve a single practitioner by ID.
func (h *Handler) GetPractitioner(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/practitioners/")
	resp, err := h.svc.GetPractitioner(r.Context(), id)
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
