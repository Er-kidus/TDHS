package handler

import (
	"encoding/json"
	"net/http"
)

// ListPharmacyInventorys handles GET requests to list all pharmacy-inventorys.
func (h *Handler) ListPharmacyInventorys(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListPharmacyInventorys(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
