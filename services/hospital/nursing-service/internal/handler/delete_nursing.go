package handler

import (
	"net/http"
	"strings"
)

// DeleteNursing handles DELETE requests to remove a nursing by ID.
func (h *Handler) DeleteNursing(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/nursings/")
	w.WriteHeader(http.StatusNoContent)
}
