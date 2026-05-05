package handler

import (
	"encoding/json"
	"net/http"
)

// ListSurgerySchedulings handles GET requests to list all surgery-schedulings.
func (h *Handler) ListSurgerySchedulings(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListSurgerySchedulings(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
