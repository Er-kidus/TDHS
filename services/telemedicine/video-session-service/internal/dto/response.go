package dto

// VideoSessionResponse is the standard response payload for a single video-session.
type VideoSessionResponse struct {
	ID string `json:"id"`
}

// ListVideoSessionResponse is the response payload for a list of video-sessions.
type ListVideoSessionResponse struct {
	Items []VideoSessionResponse `json:"items"`
	Total int                       `json:"total"`
}
