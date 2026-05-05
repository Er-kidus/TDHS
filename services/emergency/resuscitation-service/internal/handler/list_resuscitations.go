package handler

import (
	"encoding/json"
	"net/http"
)

// ListResuscitations handles GET requests to list all resuscitations.
func (h *Handler) ListResuscitations(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListResuscitations(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
