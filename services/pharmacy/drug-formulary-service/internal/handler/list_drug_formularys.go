package handler

import (
	"encoding/json"
	"net/http"
)

// ListDrugFormularys handles GET requests to list all drug-formularys.
func (h *Handler) ListDrugFormularys(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListDrugFormularys(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
