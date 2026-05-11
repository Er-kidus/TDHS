package dto

// SessionResponse is the standard response payload for a single session.
type SessionResponse struct {
	ID string `json:"id"`
}

// ListSessionResponse is the response payload for a list of sessions.
type ListSessionResponse struct {
	Items []SessionResponse `json:"items"`
	Total int                       `json:"total"`
}
