package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetAccessControl handles GET requests to retrieve a single access-control by ID.
func (h *Handler) GetAccessControl(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/access-controls/")
	resp, err := h.svc.GetAccessControl(r.Context(), id)
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
