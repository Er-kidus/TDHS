package handler

import (
	"encoding/json"
	"net/http"
)

// ListTriages handles GET requests to list all triages.
func (h *Handler) ListTriages(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListTriages(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
