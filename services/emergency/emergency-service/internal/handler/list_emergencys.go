package handler

import (
	"encoding/json"
	"net/http"
)

// ListEmergencys handles GET requests to list all emergencys.
func (h *Handler) ListEmergencys(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListEmergencys(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
