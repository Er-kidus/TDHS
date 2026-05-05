package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetIntegrationJob handles GET requests to retrieve a single integration-job by ID.
func (h *Handler) GetIntegrationJob(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/integration-jobs/")
	resp, err := h.svc.GetIntegrationJob(r.Context(), id)
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
