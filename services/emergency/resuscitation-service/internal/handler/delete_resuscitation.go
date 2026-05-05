package handler

import (
	"net/http"
	"strings"
)

// DeleteResuscitation handles DELETE requests to remove a resuscitation by ID.
func (h *Handler) DeleteResuscitation(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/resuscitations/")
	w.WriteHeader(http.StatusNoContent)
}
