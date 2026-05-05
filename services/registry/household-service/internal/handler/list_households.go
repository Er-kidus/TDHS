package handler

import (
	"encoding/json"
	"net/http"
)

// ListHouseholds handles GET requests to list all households.
func (h *Handler) ListHouseholds(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListHouseholds(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
