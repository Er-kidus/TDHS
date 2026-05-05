package dto

// CreateFlowBoardRequest holds the fields required to create a flow-board.
type CreateFlowBoardRequest struct {
}

// UpdateFlowBoardRequest holds the fields that can be updated on a flow-board.
type UpdateFlowBoardRequest struct {
	ID string `json:"id"`
}
