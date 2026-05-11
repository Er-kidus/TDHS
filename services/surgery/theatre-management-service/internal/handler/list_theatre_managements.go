package handler

import (
	"encoding/json"
	"net/http"
)

// ListTheatreManagements handles GET requests to list all theatre-managements.
func (h *Handler) ListTheatreManagements(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListTheatreManagements(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
