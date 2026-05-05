package handler

import (
	"encoding/json"
	"net/http"
)

// ListProcurements handles GET requests to list all procurements.
func (h *Handler) ListProcurements(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListProcurements(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
