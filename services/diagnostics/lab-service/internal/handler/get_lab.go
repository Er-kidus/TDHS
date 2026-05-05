package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetLab handles GET requests to retrieve a single lab by ID.
func (h *Handler) GetLab(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/labs/")
	resp, err := h.svc.GetLab(r.Context(), id)
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
