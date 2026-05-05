package dto

// CreateImagingRequest holds the fields required to create a imaging.
type CreateImagingRequest struct {
}

// UpdateImagingRequest holds the fields that can be updated on a imaging.
type UpdateImagingRequest struct {
	ID string `json:"id"`
}
