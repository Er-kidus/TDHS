package dto

// CreateOrganizationRequest holds the fields required to create a organization.
type CreateOrganizationRequest struct {
}

// UpdateOrganizationRequest holds the fields that can be updated on a organization.
type UpdateOrganizationRequest struct {
	ID string `json:"id"`
}
