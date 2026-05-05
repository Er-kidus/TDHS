package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetSpecimen handles GET requests to retrieve a single specimen by ID.
func (h *Handler) GetSpecimen(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/specimens/")
	resp, err := h.svc.GetSpecimen(r.Context(), id)
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
