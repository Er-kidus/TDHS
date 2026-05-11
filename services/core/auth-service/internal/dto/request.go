package dto

// CreateAuthRequest holds the fields required to create a auth.
type CreateAuthRequest struct {
}

// UpdateAuthRequest holds the fields that can be updated on a auth.
type UpdateAuthRequest struct {
	ID string `json:"id"`
}
