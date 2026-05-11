package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetForm handles GET requests to retrieve a single form by ID.
func (h *Handler) GetForm(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/forms/")
	resp, err := h.svc.GetForm(r.Context(), id)
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
