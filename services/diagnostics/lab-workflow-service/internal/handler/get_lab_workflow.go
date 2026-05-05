package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// GetLabWorkflow handles GET requests to retrieve a single lab-workflow by ID.
func (h *Handler) GetLabWorkflow(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/lab-workflows/")
	resp, err := h.svc.GetLabWorkflow(r.Context(), id)
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
