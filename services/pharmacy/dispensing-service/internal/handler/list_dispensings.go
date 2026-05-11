package handler

import (
	"encoding/json"
	"net/http"
)

// ListDispensings handles GET requests to list all dispensings.
func (h *Handler) ListDispensings(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListDispensings(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
