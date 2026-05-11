package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/flow-board-service/internal/dto"
)

// UpdateFlowBoard handles PUT requests to update an existing flow-board.
func (h *Handler) UpdateFlowBoard(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateFlowBoardRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.UpdateFlowBoard(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
