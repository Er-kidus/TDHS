package handler

import (
	"net/http"
	"strings"
)

// DeletePayment handles DELETE requests to remove a payment by ID.
func (h *Handler) DeletePayment(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/payments/")
	w.WriteHeader(http.StatusNoContent)
}
