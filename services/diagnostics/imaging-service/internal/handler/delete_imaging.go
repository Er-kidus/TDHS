package handler

import (
	"net/http"
	"strings"
)

// DeleteImaging handles DELETE requests to remove a imaging by ID.
func (h *Handler) DeleteImaging(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/imagings/")
	w.WriteHeader(http.StatusNoContent)
}
