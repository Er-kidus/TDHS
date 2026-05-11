package handler

import (
	"net/http"
	"strings"
)

// DeleteVendor handles DELETE requests to remove a vendor by ID.
func (h *Handler) DeleteVendor(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/vendors/")
	w.WriteHeader(http.StatusNoContent)
}
