package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetDataQuality handles GET requests to retrieve a single data-quality by ID.
func (h *Handler) GetDataQuality(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/data-qualitys/")
	resp, err := h.svc.GetDataQuality(r.Context(), id)
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
