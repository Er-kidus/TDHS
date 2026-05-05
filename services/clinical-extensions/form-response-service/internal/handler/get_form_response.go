package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetFormResponse handles GET requests to retrieve a single form-response by ID.
func (h *Handler) GetFormResponse(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/form-responses/")
	resp, err := h.svc.GetFormResponse(r.Context(), id)
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
