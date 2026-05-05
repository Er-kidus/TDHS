package dto

// CreateIcuRequest holds the fields required to create a icu.
type CreateIcuRequest struct {
}

// UpdateIcuRequest holds the fields that can be updated on a icu.
type UpdateIcuRequest struct {
	ID string `json:"id"`
}
