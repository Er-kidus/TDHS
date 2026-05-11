package dto

// CreateChatRequest holds the fields required to create a chat.
type CreateChatRequest struct {
}

// UpdateChatRequest holds the fields that can be updated on a chat.
type UpdateChatRequest struct {
	ID string `json:"id"`
}
