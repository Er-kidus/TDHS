package handler

import (
	"encoding/json"
	"net/http"
)

// ListValidations handles GET requests to list all validations.
func (h *Handler) ListValidations(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListValidations(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
