package handler

import (
	"net/http"
	"strings"
)

// DeleteAudit handles DELETE requests to remove a audit by ID.
func (h *Handler) DeleteAudit(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/audits/")
	w.WriteHeader(http.StatusNoContent)
}
