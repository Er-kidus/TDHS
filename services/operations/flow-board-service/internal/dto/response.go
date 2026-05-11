package dto

// FlowBoardResponse is the standard response payload for a single flow-board.
type FlowBoardResponse struct {
	ID string `json:"id"`
}

// ListFlowBoardResponse is the response payload for a list of flow-boards.
type ListFlowBoardResponse struct {
	Items []FlowBoardResponse `json:"items"`
	Total int                       `json:"total"`
}
