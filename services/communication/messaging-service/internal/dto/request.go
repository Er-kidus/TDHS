package dto

// CreateMessagingRequest holds the fields required to create a messaging.
type CreateMessagingRequest struct {
}

// UpdateMessagingRequest holds the fields that can be updated on a messaging.
type UpdateMessagingRequest struct {
	ID string `json:"id"`
}
