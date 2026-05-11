package dto

// CreateCareplanRequest holds the fields required to create a careplan.
type CreateCareplanRequest struct {
}

// UpdateCareplanRequest holds the fields that can be updated on a careplan.
type UpdateCareplanRequest struct {
	ID string `json:"id"`
}
