package handler

import (
	"encoding/json"
	"net/http"
)

// ListReportings handles GET requests to list all reportings.
func (h *Handler) ListReportings(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListReportings(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
