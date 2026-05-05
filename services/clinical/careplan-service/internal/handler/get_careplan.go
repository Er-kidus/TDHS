package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetCareplan handles GET requests to retrieve a single careplan by ID.
func (h *Handler) GetCareplan(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/careplans/")
	resp, err := h.svc.GetCareplan(r.Context(), id)
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
