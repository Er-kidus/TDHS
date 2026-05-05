package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetLogistics handles GET requests to retrieve a single logistics by ID.
func (h *Handler) GetLogistics(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/logisticss/")
	resp, err := h.svc.GetLogistics(r.Context(), id)
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
