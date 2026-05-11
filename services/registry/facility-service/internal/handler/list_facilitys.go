package handler

import (
	"encoding/json"
	"net/http"
)

// ListFacilitys handles GET requests to list all facilitys.
func (h *Handler) ListFacilitys(w http.ResponseWriter, r *http.Request) {
	resp, err := h.svc.ListFacilitys(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
