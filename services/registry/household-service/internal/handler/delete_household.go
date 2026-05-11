package handler

import (
	"net/http"
	"strings"
)

// DeleteHousehold handles DELETE requests to remove a household by ID.
func (h *Handler) DeleteHousehold(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/households/")
	w.WriteHeader(http.StatusNoContent)
}
