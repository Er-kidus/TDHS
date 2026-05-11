package dto

// CreateResultRequest holds the fields required to create a result.
type CreateResultRequest struct {
}

// UpdateResultRequest holds the fields that can be updated on a result.
type UpdateResultRequest struct {
	ID string `json:"id"`
}
