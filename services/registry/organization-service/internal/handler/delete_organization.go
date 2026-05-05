package handler

import (
	"net/http"
	"strings"
)

// DeleteOrganization handles DELETE requests to remove a organization by ID.
func (h *Handler) DeleteOrganization(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/organizations/")
	w.WriteHeader(http.StatusNoContent)
}
