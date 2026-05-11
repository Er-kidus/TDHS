package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/messaging-service/internal/dto"
)

// CreateMessaging handles POST requests to create a new messaging.
func (h *Handler) CreateMessaging(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateMessagingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateMessaging(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
