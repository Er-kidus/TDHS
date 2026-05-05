package dto

// UserResponse is the standard response payload for a single user.
type UserResponse struct {
	ID string `json:"id"`
}

// ListUserResponse is the response payload for a list of users.
type ListUserResponse struct {
	Items []UserResponse `json:"items"`
	Total int                       `json:"total"`
}
