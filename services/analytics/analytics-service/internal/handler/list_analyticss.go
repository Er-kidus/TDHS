package handler

import (
	"encoding/json"
	"net/http"
)

// ListAnalyticss handles GET requests to list all analyticss.
func (h *Handler) ListAnalyticss(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListAnalyticss(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
