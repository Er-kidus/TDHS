package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetFhir handles GET requests to retrieve a single fhir by ID.
func (h *Handler) GetFhir(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/fhirs/")
	resp, err := h.svc.GetFhir(r.Context(), id)
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
