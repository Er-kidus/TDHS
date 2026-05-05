package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetDocument handles GET requests to retrieve a single document by ID.
func (h *Handler) GetDocument(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/documents/")
	resp, err := h.svc.GetDocument(r.Context(), id)
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
