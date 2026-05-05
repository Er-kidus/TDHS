package handler

import (
	"encoding/json"
	"net/http"
)

// ListClaimss handles GET requests to list all claimss.
func (h *Handler) ListClaimss(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListClaimss(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
