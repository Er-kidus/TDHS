package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetClaims handles GET requests to retrieve a single claims by ID.
func (h *Handler) GetClaims(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/claimss/")
	resp, err := h.svc.GetClaims(r.Context(), id)
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
