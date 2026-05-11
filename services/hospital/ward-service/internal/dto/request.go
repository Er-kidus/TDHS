package dto

// CreateWardRequest holds the fields required to create a ward.
type CreateWardRequest struct {
}

// UpdateWardRequest holds the fields that can be updated on a ward.
type UpdateWardRequest struct {
	ID string `json:"id"`
}
