package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetSurgeryProtocol handles GET requests to retrieve a single surgery-protocol by ID.
func (h *Handler) GetSurgeryProtocol(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/surgery-protocols/")
	resp, err := h.svc.GetSurgeryProtocol(r.Context(), id)
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
