package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetPostOperativeCare handles GET requests to retrieve a single post-operative-care by ID.
func (h *Handler) GetPostOperativeCare(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/post-operative-cares/")
	resp, err := h.svc.GetPostOperativeCare(r.Context(), id)
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
