package dto

// CreateResuscitationRequest holds the fields required to create a resuscitation.
type CreateResuscitationRequest struct {
}

// UpdateResuscitationRequest holds the fields that can be updated on a resuscitation.
type UpdateResuscitationRequest struct {
	ID string `json:"id"`
}
