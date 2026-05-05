package dto

// CreateVideoSessionRequest holds the fields required to create a video-session.
type CreateVideoSessionRequest struct {
}

// UpdateVideoSessionRequest holds the fields that can be updated on a video-session.
type UpdateVideoSessionRequest struct {
	ID string `json:"id"`
}
