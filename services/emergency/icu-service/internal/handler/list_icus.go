package handler

import (
	"encoding/json"
	"net/http"
)

// ListIcus handles GET requests to list all icus.
func (h *Handler) ListIcus(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListIcus(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
