package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetProgramReporting handles GET requests to retrieve a single program-reporting by ID.
func (h *Handler) GetProgramReporting(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/program-reportings/")
	resp, err := h.svc.GetProgramReporting(r.Context(), id)
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
