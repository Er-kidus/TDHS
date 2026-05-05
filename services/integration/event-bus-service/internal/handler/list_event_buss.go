package handler

import (
	"encoding/json"
	"net/http"
)

// ListEventBuss handles GET requests to list all event-buss.
func (h *Handler) ListEventBuss(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListEventBuss(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
