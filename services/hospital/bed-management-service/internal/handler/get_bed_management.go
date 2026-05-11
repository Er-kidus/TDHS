package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetBedManagement handles GET requests to retrieve a single bed-management by ID.
func (h *Handler) GetBedManagement(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/bed-managements/")
	resp, err := h.svc.GetBedManagement(r.Context(), id)
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
