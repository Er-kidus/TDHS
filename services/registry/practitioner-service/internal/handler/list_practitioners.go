package handler

import (
	"encoding/json"
	"net/http"
)

// ListPractitioners handles GET requests to list all practitioners.
func (h *Handler) ListPractitioners(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListPractitioners(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
