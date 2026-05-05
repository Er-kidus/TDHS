package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetProgram handles GET requests to retrieve a single program by ID.
func (h *Handler) GetProgram(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/programs/")
	resp, err := h.svc.GetProgram(r.Context(), id)
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
