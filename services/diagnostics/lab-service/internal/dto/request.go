package dto

// CreateLabRequest holds the fields required to create a lab.
type CreateLabRequest struct {
}

// UpdateLabRequest holds the fields that can be updated on a lab.
type UpdateLabRequest struct {
	ID string `json:"id"`
}
