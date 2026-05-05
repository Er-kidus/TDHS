package handler

import (
	"encoding/json"
	"net/http"
)

// ListForms handles GET requests to list all forms.
func (h *Handler) ListForms(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListForms(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
