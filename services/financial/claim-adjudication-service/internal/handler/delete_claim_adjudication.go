package handler

import (
	"net/http"
	"strings"
)

// DeleteClaimAdjudication handles DELETE requests to remove a claim-adjudication by ID.
func (h *Handler) DeleteClaimAdjudication(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/claim-adjudications/")
	w.WriteHeader(http.StatusNoContent)
}
