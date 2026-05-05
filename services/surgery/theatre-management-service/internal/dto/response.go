package dto

// TheatreManagementResponse is the standard response payload for a single theatre-management.
type TheatreManagementResponse struct {
	ID string `json:"id"`
}

// ListTheatreManagementResponse is the response payload for a list of theatre-managements.
type ListTheatreManagementResponse struct {
	Items []TheatreManagementResponse `json:"items"`
	Total int                       `json:"total"`
}
