package handler

import (
	"net/http"
	"strings"
)

// DeleteDataQuality handles DELETE requests to remove a data-quality by ID.
func (h *Handler) DeleteDataQuality(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/data-qualitys/")
	w.WriteHeader(http.StatusNoContent)
}
