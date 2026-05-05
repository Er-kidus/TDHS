package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetIcu handles GET requests to retrieve a single icu by ID.
func (h *Handler) GetIcu(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/icus/")
	resp, err := h.svc.GetIcu(r.Context(), id)
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
