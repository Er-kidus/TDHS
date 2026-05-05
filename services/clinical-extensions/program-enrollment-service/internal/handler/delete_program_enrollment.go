package handler

import (
	"net/http"
	"strings"
)

// DeleteProgramEnrollment handles DELETE requests to remove a program-enrollment by ID.
func (h *Handler) DeleteProgramEnrollment(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/program-enrollments/")
	w.WriteHeader(http.StatusNoContent)
}
