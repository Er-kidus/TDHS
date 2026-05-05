package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetDischargePlanning handles GET requests to retrieve a single discharge-planning by ID.
func (h *Handler) GetDischargePlanning(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/discharge-plannings/")
	resp, err := h.svc.GetDischargePlanning(r.Context(), id)
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
