package handler

import (
	"encoding/json"
	"net/http"
)

// ListTeleTriages handles GET requests to list all tele-triages.
func (h *Handler) ListTeleTriages(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListTeleTriages(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
