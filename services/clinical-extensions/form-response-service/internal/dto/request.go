package dto

// CreateFormResponseRequest holds the fields required to create a form-response.
type CreateFormResponseRequest struct {
}

// UpdateFormResponseRequest holds the fields that can be updated on a form-response.
type UpdateFormResponseRequest struct {
	ID string `json:"id"`
}
