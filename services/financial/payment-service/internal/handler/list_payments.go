package handler

import (
	"encoding/json"
	"net/http"
)

// ListPayments handles GET requests to list all payments.
func (h *Handler) ListPayments(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListPayments(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
