package dto

// MessagingResponse is the standard response payload for a single messaging.
type MessagingResponse struct {
	ID string `json:"id"`
}

// ListMessagingResponse is the response payload for a list of messagings.
type ListMessagingResponse struct {
	Items []MessagingResponse `json:"items"`
	Total int                       `json:"total"`
}
