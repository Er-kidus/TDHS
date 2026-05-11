package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetDataMapping handles GET requests to retrieve a single data-mapping by ID.
func (h *Handler) GetDataMapping(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/data-mappings/")
	resp, err := h.svc.GetDataMapping(r.Context(), id)
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
