package handler

import (
	"encoding/json"
	"net/http"
)

// ListMessagings handles GET requests to list all messagings.
func (h *Handler) ListMessagings(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListMessagings(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
