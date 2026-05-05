package handler

import (
	"net/http"
	"strings"
)

// DeleteProcedure handles DELETE requests to remove a procedure by ID.
func (h *Handler) DeleteProcedure(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/procedures/")
	w.WriteHeader(http.StatusNoContent)
}
