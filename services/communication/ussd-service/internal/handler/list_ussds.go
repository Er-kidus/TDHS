package handler

import (
	"encoding/json"
	"net/http"
)

// ListUssds handles GET requests to list all ussds.
func (h *Handler) ListUssds(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListUssds(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
