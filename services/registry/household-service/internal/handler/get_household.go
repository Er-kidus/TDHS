package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetHousehold handles GET requests to retrieve a single household by ID.
func (h *Handler) GetHousehold(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/households/")
	resp, err := h.svc.GetHousehold(r.Context(), id)
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
