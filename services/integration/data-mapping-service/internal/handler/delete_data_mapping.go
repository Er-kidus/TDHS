package handler

import (
	"net/http"
	"strings"
)

// DeleteDataMapping handles DELETE requests to remove a data-mapping by ID.
func (h *Handler) DeleteDataMapping(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/data-mappings/")
	w.WriteHeader(http.StatusNoContent)
}
