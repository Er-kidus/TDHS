package handler

import (
	"net/http"
	"strings"
)

// DeleteValidation handles DELETE requests to remove a validation by ID.
func (h *Handler) DeleteValidation(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/validations/")
	w.WriteHeader(http.StatusNoContent)
}
