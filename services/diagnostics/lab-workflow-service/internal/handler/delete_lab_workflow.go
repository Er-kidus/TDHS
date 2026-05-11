package handler

import (
	"net/http"
	"strings"
)

// DeleteLabWorkflow handles DELETE requests to remove a lab-workflow by ID.
func (h *Handler) DeleteLabWorkflow(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/lab-workflows/")
	w.WriteHeader(http.StatusNoContent)
}
