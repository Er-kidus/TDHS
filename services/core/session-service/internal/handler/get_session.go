package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetSession handles GET requests to retrieve a single session by ID.
func (h *Handler) GetSession(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/sessions/")
	resp, err := h.svc.GetSession(r.Context(), id)
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
