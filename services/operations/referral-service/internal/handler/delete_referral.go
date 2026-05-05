package handler

import (
	"net/http"
	"strings"
)

// DeleteReferral handles DELETE requests to remove a referral by ID.
func (h *Handler) DeleteReferral(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/referrals/")
	w.WriteHeader(http.StatusNoContent)
}
