package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetTriage handles GET requests to retrieve a single triage by ID.
func (h *Handler) GetTriage(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/triages/")
	resp, err := h.svc.GetTriage(r.Context(), id)
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
