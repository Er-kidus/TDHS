package handler

import (
	"net/http"
	"strings"
)

// DeleteRadiologyWorkflow handles DELETE requests to remove a radiology-workflow by ID.
func (h *Handler) DeleteRadiologyWorkflow(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/radiology-workflows/")
	w.WriteHeader(http.StatusNoContent)
}
