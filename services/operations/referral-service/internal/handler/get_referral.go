package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetReferral handles GET requests to retrieve a single referral by ID.
func (h *Handler) GetReferral(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/referrals/")
	resp, err := h.svc.GetReferral(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if resp == nil {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
