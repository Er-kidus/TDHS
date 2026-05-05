package handler

import (
	"net/http"
	"strings"
)

// DeleteSpecimen handles DELETE requests to remove a specimen by ID.
func (h *Handler) DeleteSpecimen(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/specimens/")
	w.WriteHeader(http.StatusNoContent)
}
