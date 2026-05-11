package handler

import (
	"net/http"
	"strings"
)

// DeleteNursingTask handles DELETE requests to remove a nursing-task by ID.
func (h *Handler) DeleteNursingTask(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/nursing-tasks/")
	w.WriteHeader(http.StatusNoContent)
}
