package dto

// SurgerySchedulingResponse is the standard response payload for a single surgery-scheduling.
type SurgerySchedulingResponse struct {
	ID string `json:"id"`
}

// ListSurgerySchedulingResponse is the response payload for a list of surgery-schedulings.
type ListSurgerySchedulingResponse struct {
	Items []SurgerySchedulingResponse `json:"items"`
	Total int                       `json:"total"`
}
