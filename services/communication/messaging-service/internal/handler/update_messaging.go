package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/messaging-service/internal/dto"
)

// UpdateMessaging handles PUT requests to update an existing messaging.
func (h *Handler) UpdateMessaging(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateMessagingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateMessaging(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
