package handler

import (
	"encoding/json"
	"net/http"
)

// ListSurgeryProtocols handles GET requests to list all surgery-protocols.
func (h *Handler) ListSurgeryProtocols(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListSurgeryProtocols(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
