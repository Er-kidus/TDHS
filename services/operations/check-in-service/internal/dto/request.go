package dto

// CreateCheckInRequest holds the fields required to create a check-in.
type CreateCheckInRequest struct {
}

// UpdateCheckInRequest holds the fields that can be updated on a check-in.
type UpdateCheckInRequest struct {
	ID string `json:"id"`
}
