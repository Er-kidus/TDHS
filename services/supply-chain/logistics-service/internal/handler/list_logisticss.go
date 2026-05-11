package handler

import (
	"encoding/json"
	"net/http"
)

// ListLogisticss handles GET requests to list all logisticss.
func (h *Handler) ListLogisticss(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListLogisticss(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
