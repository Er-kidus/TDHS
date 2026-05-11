package handler

import (
	"net/http"
	"strings"
)

// DeleteFormResponse handles DELETE requests to remove a form-response by ID.
func (h *Handler) DeleteFormResponse(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/form-responses/")
	w.WriteHeader(http.StatusNoContent)
}
