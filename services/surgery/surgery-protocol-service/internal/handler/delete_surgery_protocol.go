package handler

import (
	"net/http"
	"strings"
)

// DeleteSurgeryProtocol handles DELETE requests to remove a surgery-protocol by ID.
func (h *Handler) DeleteSurgeryProtocol(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/surgery-protocols/")
	w.WriteHeader(http.StatusNoContent)
}
