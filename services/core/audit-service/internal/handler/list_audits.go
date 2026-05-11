package handler

import (
	"encoding/json"
	"net/http"
)

// ListAudits handles GET requests to list all audits.
func (h *Handler) ListAudits(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListAudits(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
