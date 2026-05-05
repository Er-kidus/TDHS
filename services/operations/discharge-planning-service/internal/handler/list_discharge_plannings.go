package handler

import (
	"encoding/json"
	"net/http"
)

// ListDischargePlannings handles GET requests to list all discharge-plannings.
func (h *Handler) ListDischargePlannings(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListDischargePlannings(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
