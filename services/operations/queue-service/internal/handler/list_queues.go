package handler

import (
	"encoding/json"
	"net/http"
)

// ListQueues handles GET requests to list all queues.
func (h *Handler) ListQueues(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListQueues(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
