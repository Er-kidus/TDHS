package dto

// OrganizationResponse is the standard response payload for a single organization.
type OrganizationResponse struct {
	ID string `json:"id"`
}

// ListOrganizationResponse is the response payload for a list of organizations.
type ListOrganizationResponse struct {
	Items []OrganizationResponse `json:"items"`
	Total int                       `json:"total"`
}
