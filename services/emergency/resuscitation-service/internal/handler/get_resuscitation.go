package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetResuscitation handles GET requests to retrieve a single resuscitation by ID.
func (h *Handler) GetResuscitation(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/resuscitations/")
	resp, err := h.svc.GetResuscitation(r.Context(), id)
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
