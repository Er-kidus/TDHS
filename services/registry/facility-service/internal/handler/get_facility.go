package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetFacility handles GET requests to retrieve a single facility by ID.
func (h *Handler) GetFacility(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/facilitys/")
	resp, err := h.svc.GetFacility(r.Context(), id)
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
