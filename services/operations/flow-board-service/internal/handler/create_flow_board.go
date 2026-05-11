package handler

import (
	"encoding/json"
	"net/http"
	"github.com/tenadam/flow-board-service/internal/dto"
)

// CreateFlowBoard handles POST requests to create a new flow-board.
func (h *Handler) CreateFlowBoard(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateFlowBoardRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp, err := h.svc.CreateFlowBoard(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
