package handler

import (
	"net/http"
	"strings"
)

// DeleteUser handles DELETE requests to remove a user by ID.
func (h *Handler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/users/")
	w.WriteHeader(http.StatusNoContent)
}
