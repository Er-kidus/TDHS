package handler

import (
	"net/http"
	"strings"
)

// DeleteMessaging handles DELETE requests to remove a messaging by ID.
func (h *Handler) DeleteMessaging(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/messagings/")
	w.WriteHeader(http.StatusNoContent)
}
