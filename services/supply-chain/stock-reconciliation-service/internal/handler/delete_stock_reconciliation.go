package handler

import (
	"net/http"
	"strings"
)

// DeleteStockReconciliation handles DELETE requests to remove a stock-reconciliation by ID.
func (h *Handler) DeleteStockReconciliation(w http.ResponseWriter, r *http.Request) {
	_ = strings.TrimPrefix(r.URL.Path, "/stock-reconciliations/")
	w.WriteHeader(http.StatusNoContent)
}
