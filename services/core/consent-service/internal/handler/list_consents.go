package handler

import (
	"encoding/json"
	"net/http"
)

// ListConsents handles GET requests to list all consents.
func (h *Handler) ListConsents(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListConsents(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
