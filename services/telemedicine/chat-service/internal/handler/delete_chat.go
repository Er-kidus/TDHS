package handler

import (
	"net/http"
	"strings"
)

// DeleteChat handles DELETE requests to remove a chat by ID.
func (h *Handler) DeleteChat(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/chats/")
	w.WriteHeader(http.StatusNoContent)
}
