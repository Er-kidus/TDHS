package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/chat-service/internal/dto"
)

// CreateChat handles POST requests to create a new chat.
func (h *Handler) CreateChat(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateChat(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
