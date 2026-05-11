package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetAuth handles GET requests to retrieve a single auth by ID.
func (h *Handler) GetAuth(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/auths/")
	resp, err := h.svc.GetAuth(r.Context(), id)
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
