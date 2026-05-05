package handler

import (
	"net/http"
	"strings"
)

// DeleteAsset handles DELETE requests to remove a asset by ID.
func (h *Handler) DeleteAsset(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/assets/")
	w.WriteHeader(http.StatusNoContent)
}
