package handler

import (
	"encoding/json"
	"net/http"
)

// ListUsers handles GET requests to list all users.
func (h *Handler) ListUsers(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListUsers(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
