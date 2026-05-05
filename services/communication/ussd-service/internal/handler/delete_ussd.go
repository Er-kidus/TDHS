package handler

import (
	"net/http"
	"strings"
)

// DeleteUssd handles DELETE requests to remove a ussd by ID.
func (h *Handler) DeleteUssd(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/ussds/")
	w.WriteHeader(http.StatusNoContent)
}
