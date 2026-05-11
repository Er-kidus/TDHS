package handler

import (
	"net/http"
	"strings"
)

// DeleteEventBus handles DELETE requests to remove a event-bus by ID.
func (h *Handler) DeleteEventBus(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/event-buss/")
	w.WriteHeader(http.StatusNoContent)
}
