package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetTeleTriage handles GET requests to retrieve a single tele-triage by ID.
func (h *Handler) GetTeleTriage(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/tele-triages/")
	resp, err := h.svc.GetTeleTriage(r.Context(), id)
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
