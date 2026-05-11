package dto

// ShiftHandoffResponse is the standard response payload for a single shift-handoff.
type ShiftHandoffResponse struct {
	ID string `json:"id"`
}

// ListShiftHandoffResponse is the response payload for a list of shift-handoffs.
type ListShiftHandoffResponse struct {
	Items []ShiftHandoffResponse `json:"items"`
	Total int                       `json:"total"`
}
