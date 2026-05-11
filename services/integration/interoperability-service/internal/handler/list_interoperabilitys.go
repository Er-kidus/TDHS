package handler

import (
	"encoding/json"
	"net/http"
)

// ListInteroperabilitys handles GET requests to list all interoperabilitys.
func (h *Handler) ListInteroperabilitys(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListInteroperabilitys(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
