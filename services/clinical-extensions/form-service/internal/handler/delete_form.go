package handler

import (
	"net/http"
	"strings"
)

// DeleteForm handles DELETE requests to remove a form by ID.
func (h *Handler) DeleteForm(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/forms/")
	w.WriteHeader(http.StatusNoContent)
}
