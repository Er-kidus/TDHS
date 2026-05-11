package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetNotification handles GET requests to retrieve a single notification by ID.
func (h *Handler) GetNotification(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/notifications/")
	resp, err := h.svc.GetNotification(r.Context(), id)
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
