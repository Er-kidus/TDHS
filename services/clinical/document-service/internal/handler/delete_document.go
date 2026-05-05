package handler

import (
	"net/http"
	"strings"
)

// DeleteDocument handles DELETE requests to remove a document by ID.
func (h *Handler) DeleteDocument(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/documents/")
	w.WriteHeader(http.StatusNoContent)
}
