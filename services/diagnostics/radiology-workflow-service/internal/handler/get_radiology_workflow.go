package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetRadiologyWorkflow handles GET requests to retrieve a single radiology-workflow by ID.
func (h *Handler) GetRadiologyWorkflow(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/radiology-workflows/")
	resp, err := h.svc.GetRadiologyWorkflow(r.Context(), id)
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
