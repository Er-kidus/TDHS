package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/chat-service/internal/dto"
)

// UpdateChat handles PUT requests to update an existing chat.
func (h *Handler) UpdateChat(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateChat(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
