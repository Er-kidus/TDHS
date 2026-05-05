package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/document-service/internal/dto"
)

// CreateDocument handles POST requests to create a new document.
func (h *Handler) CreateDocument(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateDocumentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateDocument(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
