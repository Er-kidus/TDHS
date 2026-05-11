package dto

// CreateAccessControlRequest holds the fields required to create a access-control.
type CreateAccessControlRequest struct {
}

// UpdateAccessControlRequest holds the fields that can be updated on a access-control.
type UpdateAccessControlRequest struct {
	ID string `json:"id"`
}
