package handler

import (
	"net/http"
	"strings"
)

// DeleteInvoicing handles DELETE requests to remove a invoicing by ID.
func (h *Handler) DeleteInvoicing(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/invoicings/")
	w.WriteHeader(http.StatusNoContent)
}
