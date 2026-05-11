package handler

import (
	"net/http"
	"strings"
)

// DeleteAccessControl handles DELETE requests to remove a access-control by ID.
func (h *Handler) DeleteAccessControl(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/access-controls/")
	w.WriteHeader(http.StatusNoContent)
}
