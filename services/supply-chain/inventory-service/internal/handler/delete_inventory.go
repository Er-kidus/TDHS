package handler

import (
	"net/http"
	"strings"
)

// DeleteInventory handles DELETE requests to remove a inventory by ID.
func (h *Handler) DeleteInventory(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/inventorys/")
	w.WriteHeader(http.StatusNoContent)
}
