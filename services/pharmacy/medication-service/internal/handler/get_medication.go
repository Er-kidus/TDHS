package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetMedication handles GET requests to retrieve a single medication by ID.
func (h *Handler) GetMedication(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/medications/")
	resp, err := h.svc.GetMedication(r.Context(), id)
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
