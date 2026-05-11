package handler

import (
	"encoding/json"
	"net/http"
)

// ListTerminologys handles GET requests to list all terminologys.
func (h *Handler) ListTerminologys(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListTerminologys(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
