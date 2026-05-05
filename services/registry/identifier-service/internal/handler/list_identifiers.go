package handler

import (
	"encoding/json"
	"net/http"
)

// ListIdentifiers handles GET requests to list all identifiers.
func (h *Handler) ListIdentifiers(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListIdentifiers(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
