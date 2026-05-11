package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetEncounter handles GET requests to retrieve a single encounter by ID.
func (h *Handler) GetEncounter(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/encounters/")
	resp, err := h.svc.GetEncounter(r.Context(), id)
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
