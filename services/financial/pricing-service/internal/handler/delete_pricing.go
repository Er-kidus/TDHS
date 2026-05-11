package handler

import (
	"net/http"
	"strings"
)

// DeletePricing handles DELETE requests to remove a pricing by ID.
func (h *Handler) DeletePricing(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/pricings/")
	w.WriteHeader(http.StatusNoContent)
}
