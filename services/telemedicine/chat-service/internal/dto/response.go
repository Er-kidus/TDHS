package dto

// ChatResponse is the standard response payload for a single chat.
type ChatResponse struct {
	ID string `json:"id"`
}

// ListChatResponse is the response payload for a list of chats.
type ListChatResponse struct {
	Items []ChatResponse `json:"items"`
	Total int                       `json:"total"`
}
