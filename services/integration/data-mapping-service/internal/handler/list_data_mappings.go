package handler

import (
	"encoding/json"
	"net/http"
)

// ListDataMappings handles GET requests to list all data-mappings.
func (h *Handler) ListDataMappings(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListDataMappings(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
