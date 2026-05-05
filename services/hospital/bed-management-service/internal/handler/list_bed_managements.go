package handler

import (
	"encoding/json"
	"net/http"
)

// ListBedManagements handles GET requests to list all bed-managements.
func (h *Handler) ListBedManagements(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListBedManagements(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
