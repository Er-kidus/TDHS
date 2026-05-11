package handler

import (
	"encoding/json"
	"net/http"
)

// ListInpatients handles GET requests to list all inpatients.
func (h *Handler) ListInpatients(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListInpatients(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
