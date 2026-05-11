package handler

import (
	"encoding/json"
	"net/http"
)

// ListVendors handles GET requests to list all vendors.
func (h *Handler) ListVendors(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListVendors(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
