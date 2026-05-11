package handler

import (
	"encoding/json"
	"net/http"
)

// ListInvoicings handles GET requests to list all invoicings.
func (h *Handler) ListInvoicings(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListInvoicings(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
