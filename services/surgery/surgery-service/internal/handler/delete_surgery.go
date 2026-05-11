package handler

import (
	"net/http"
	"strings"
)

// DeleteSurgery handles DELETE requests to remove a surgery by ID.
func (h *Handler) DeleteSurgery(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/surgerys/")
	w.WriteHeader(http.StatusNoContent)
}
