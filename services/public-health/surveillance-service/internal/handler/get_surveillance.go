package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetSurveillance handles GET requests to retrieve a single surveillance by ID.
func (h *Handler) GetSurveillance(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/surveillances/")
	resp, err := h.svc.GetSurveillance(r.Context(), id)
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
