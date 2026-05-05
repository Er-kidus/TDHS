package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetDispensing handles GET requests to retrieve a single dispensing by ID.
func (h *Handler) GetDispensing(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/dispensings/")
	resp, err := h.svc.GetDispensing(r.Context(), id)
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
