package handler

import (
	"encoding/json"
	"net/http"
)

// ListSurgerys handles GET requests to list all surgerys.
func (h *Handler) ListSurgerys(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListSurgerys(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
