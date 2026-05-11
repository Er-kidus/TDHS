package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/notification-service/internal/dto"
)

// CreateNotification handles POST requests to create a new notification.
func (h *Handler) CreateNotification(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateNotificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateNotification(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
