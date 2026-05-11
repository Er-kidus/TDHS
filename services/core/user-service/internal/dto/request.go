package dto

// CreateUserRequest holds the fields required to create a user.
type CreateUserRequest struct {
}

// UpdateUserRequest holds the fields that can be updated on a user.
type UpdateUserRequest struct {
	ID string `json:"id"`
}
