package handler

import (
	"encoding/json"
	"net/http"
)

// ListReferrals handles GET requests to list all referrals.
func (h *Handler) ListReferrals(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListReferrals(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
