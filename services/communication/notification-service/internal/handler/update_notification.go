package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/notification-service/internal/dto"
)

// UpdateNotification handles PUT requests to update an existing notification.
func (h *Handler) UpdateNotification(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateNotificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateNotification(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
