package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/document-service/internal/dto"
)

// UpdateDocument handles PUT requests to update an existing document.
func (h *Handler) UpdateDocument(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateDocumentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateDocument(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
