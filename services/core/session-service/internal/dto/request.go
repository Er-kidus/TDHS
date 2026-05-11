package dto

// CreateSessionRequest holds the fields required to create a session.
type CreateSessionRequest struct {
}

// UpdateSessionRequest holds the fields that can be updated on a session.
type UpdateSessionRequest struct {
	ID string `json:"id"`
}
