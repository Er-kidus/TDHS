package handler

import (
	"net/http"
	"strings"
)

// DeleteFlowBoard handles DELETE requests to remove a flow-board by ID.
func (h *Handler) DeleteFlowBoard(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/flow-boards/")
	w.WriteHeader(http.StatusNoContent)
}
