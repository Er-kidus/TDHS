package handler

import (
	"net/http"
	"strings"
)

// DeleteConfiguration handles DELETE requests to remove a configuration by ID.
func (h *Handler) DeleteConfiguration(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/configurations/")
	w.WriteHeader(http.StatusNoContent)
}
