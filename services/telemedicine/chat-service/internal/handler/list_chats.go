package handler

import (
	"encoding/json"
	"net/http"
)

// ListChats handles GET requests to list all chats.
func (h *Handler) ListChats(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListChats(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
