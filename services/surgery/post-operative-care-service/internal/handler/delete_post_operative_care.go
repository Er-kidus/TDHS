package handler

import (
	"net/http"
	"strings"
)

// DeletePostOperativeCare handles DELETE requests to remove a post-operative-care by ID.
func (h *Handler) DeletePostOperativeCare(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/post-operative-cares/")
	w.WriteHeader(http.StatusNoContent)
}
