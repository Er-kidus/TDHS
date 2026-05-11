package handler

import (
	"encoding/json"
	"net/http"
)

// ListNationalReportings handles GET requests to list all national-reportings.
func (h *Handler) ListNationalReportings(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListNationalReportings(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
