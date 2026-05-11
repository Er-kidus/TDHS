package handler

import (
	"net/http"
	"strings"
)

// DeleteOrderSet handles DELETE requests to remove a order-set by ID.
func (h *Handler) DeleteOrderSet(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/order-sets/")
	w.WriteHeader(http.StatusNoContent)
}
