package handler

import (
	"encoding/json"
	"net/http"
)

// ListBillings handles GET requests to list all billings.
func (h *Handler) ListBillings(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListBillings(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
