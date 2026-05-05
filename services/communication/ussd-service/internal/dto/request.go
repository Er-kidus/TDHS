package dto

// CreateUssdRequest holds the fields required to create a ussd.
type CreateUssdRequest struct {
}

// UpdateUssdRequest holds the fields that can be updated on a ussd.
type UpdateUssdRequest struct {
	ID string `json:"id"`
}
