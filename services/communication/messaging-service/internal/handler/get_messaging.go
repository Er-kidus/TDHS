package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetMessaging handles GET requests to retrieve a single messaging by ID.
func (h *Handler) GetMessaging(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/messagings/")
	resp, err := h.svc.GetMessaging(r.Context(), id)
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
