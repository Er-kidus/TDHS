package dto

// AccessControlResponse is the standard response payload for a single access-control.
type AccessControlResponse struct {
	ID string `json:"id"`
}

// ListAccessControlResponse is the response payload for a list of access-controls.
type ListAccessControlResponse struct {
	Items []AccessControlResponse `json:"items"`
	Total int                       `json:"total"`
}
