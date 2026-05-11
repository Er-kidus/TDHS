package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetOrganization handles GET requests to retrieve a single organization by ID.
func (h *Handler) GetOrganization(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/organizations/")
	resp, err := h.svc.GetOrganization(r.Context(), id)
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
