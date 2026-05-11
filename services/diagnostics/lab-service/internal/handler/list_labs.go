package handler

import (
	"encoding/json"
	"net/http"
)

// ListLabs handles GET requests to list all labs.
func (h *Handler) ListLabs(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListLabs(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
