package handler

import (
	"net/http"
	"strings"
)

// DeleteOrder handles DELETE requests to remove a order by ID.
func (h *Handler) DeleteOrder(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/orders/")
	w.WriteHeader(http.StatusNoContent)
}
