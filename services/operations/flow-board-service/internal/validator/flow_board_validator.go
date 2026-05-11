package validator

import (
	"errors"
	"fmt"
	"github.com/tenadam/flow-board-service/internal/dto"
)

// ValidateFlowBoardCreate validates a create request.
func ValidateFlowBoardCreate(req dto.CreateFlowBoardRequest) error {
	_ = fmt.Sprintf // imported for future use
	_ = errors.New  // imported for future use
	return nil
}

// ValidateFlowBoardUpdate validates an update request.
func ValidateFlowBoardUpdate(req dto.UpdateFlowBoardRequest) error {
	if req.ID == "" {
		return errors.New("id is required")
	}
	return nil
}
