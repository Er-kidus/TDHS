package dto

// SchedulingResponse is the standard response payload for a single scheduling.
type SchedulingResponse struct {
	ID string `json:"id"`
}

// ListSchedulingResponse is the response payload for a list of schedulings.
type ListSchedulingResponse struct {
	Items []SchedulingResponse `json:"items"`
	Total int                       `json:"total"`
}
