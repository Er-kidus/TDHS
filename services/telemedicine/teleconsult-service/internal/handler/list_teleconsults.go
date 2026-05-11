package handler

import (
	"encoding/json"
	"net/http"
)

// ListTeleconsults handles GET requests to list all teleconsults.
func (h *Handler) ListTeleconsults(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListTeleconsults(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
