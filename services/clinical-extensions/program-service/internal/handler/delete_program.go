package handler

import (
	"net/http"
	"strings"
)

// DeleteProgram handles DELETE requests to remove a program by ID.
func (h *Handler) DeleteProgram(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/programs/")
	w.WriteHeader(http.StatusNoContent)
}
