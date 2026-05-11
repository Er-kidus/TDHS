package handler

import (
	"encoding/json"
	"net/http"
)

// ListNotifications handles GET requests to list all notifications.
func (h *Handler) ListNotifications(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListNotifications(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
