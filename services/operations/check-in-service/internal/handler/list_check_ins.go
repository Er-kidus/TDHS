package handler

import (
	"encoding/json"
	"net/http"
)

// ListCheckIns handles GET requests to list all check-ins.
func (h *Handler) ListCheckIns(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListCheckIns(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
