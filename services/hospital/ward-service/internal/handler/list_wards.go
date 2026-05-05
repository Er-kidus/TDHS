package handler

import (
	"encoding/json"
	"net/http"
)

// ListWards handles GET requests to list all wards.
func (h *Handler) ListWards(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListWards(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
