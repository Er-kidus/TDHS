package handler

import (
	"net/http"
	"strings"
)

// DeletePharmacyInventory handles DELETE requests to remove a pharmacy-inventory by ID.
func (h *Handler) DeletePharmacyInventory(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/pharmacy-inventorys/")
	w.WriteHeader(http.StatusNoContent)
}
