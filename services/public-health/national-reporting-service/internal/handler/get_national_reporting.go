package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetNationalReporting handles GET requests to retrieve a single national-reporting by ID.
func (h *Handler) GetNationalReporting(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/national-reportings/")
	resp, err := h.svc.GetNationalReporting(r.Context(), id)
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
