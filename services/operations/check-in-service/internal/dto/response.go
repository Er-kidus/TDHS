package dto

// CheckInResponse is the standard response payload for a single check-in.
type CheckInResponse struct {
	ID string `json:"id"`
}

// ListCheckInResponse is the response payload for a list of check-ins.
type ListCheckInResponse struct {
	Items []CheckInResponse `json:"items"`
	Total int                       `json:"total"`
}
