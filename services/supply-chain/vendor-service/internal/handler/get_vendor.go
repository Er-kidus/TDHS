package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetVendor handles GET requests to retrieve a single vendor by ID.
func (h *Handler) GetVendor(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/vendors/")
	resp, err := h.svc.GetVendor(r.Context(), id)
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
