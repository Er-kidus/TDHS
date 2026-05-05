package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetUssd handles GET requests to retrieve a single ussd by ID.
func (h *Handler) GetUssd(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/ussds/")
	resp, err := h.svc.GetUssd(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if resp == nil {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
