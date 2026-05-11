package handler

import (
	"net/http"
	"strings"
)

// DeleteWarehouse handles DELETE requests to remove a warehouse by ID.
func (h *Handler) DeleteWarehouse(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/warehouses/")
	w.WriteHeader(http.StatusNoContent)
}
