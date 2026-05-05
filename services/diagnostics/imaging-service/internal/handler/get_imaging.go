package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetImaging handles GET requests to retrieve a single imaging by ID.
func (h *Handler) GetImaging(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/imagings/")
	resp, err := h.svc.GetImaging(r.Context(), id)
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
