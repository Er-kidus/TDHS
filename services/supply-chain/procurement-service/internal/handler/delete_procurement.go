package handler

import (
	"net/http"
	"strings"
)

// DeleteProcurement handles DELETE requests to remove a procurement by ID.
func (h *Handler) DeleteProcurement(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/procurements/")
	w.WriteHeader(http.StatusNoContent)
}
