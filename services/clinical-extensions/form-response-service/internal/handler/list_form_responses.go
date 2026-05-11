package handler

import (
	"encoding/json"
	"net/http"
)

// ListFormResponses handles GET requests to list all form-responses.
func (h *Handler) ListFormResponses(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListFormResponses(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
