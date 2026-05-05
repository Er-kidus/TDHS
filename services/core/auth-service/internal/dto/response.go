package dto

// AuthResponse is the standard response payload for a single auth.
type AuthResponse struct {
	ID string `json:"id"`
}

// ListAuthResponse is the response payload for a list of auths.
type ListAuthResponse struct {
	Items []AuthResponse `json:"items"`
	Total int                       `json:"total"`
}
