package handler

import (
	"encoding/json"
	"net/http"
)

// ListInventorys handles GET requests to list all inventorys.
func (h *Handler) ListInventorys(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListInventorys(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
