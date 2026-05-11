package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetProcurement handles GET requests to retrieve a single procurement by ID.
func (h *Handler) GetProcurement(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/procurements/")
	resp, err := h.svc.GetProcurement(r.Context(), id)
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
