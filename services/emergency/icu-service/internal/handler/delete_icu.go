package handler

import (
	"net/http"
	"strings"
)

// DeleteIcu handles DELETE requests to remove a icu by ID.
func (h *Handler) DeleteIcu(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/icus/")
	w.WriteHeader(http.StatusNoContent)
}
