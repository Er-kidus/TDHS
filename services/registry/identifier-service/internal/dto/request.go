package dto

// CreateIdentifierRequest holds the fields required to create a identifier.
type CreateIdentifierRequest struct {
}

// UpdateIdentifierRequest holds the fields that can be updated on a identifier.
type UpdateIdentifierRequest struct {
	ID string `json:"id"`
}
