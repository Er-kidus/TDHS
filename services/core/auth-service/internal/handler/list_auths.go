package handler

import (
	"encoding/json"
	"net/http"
)

// ListAuths handles GET requests to list all auths.
func (h *Handler) ListAuths(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListAuths(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
