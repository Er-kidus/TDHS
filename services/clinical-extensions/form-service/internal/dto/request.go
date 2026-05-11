package dto

// CreateFormRequest holds the fields required to create a form.
type CreateFormRequest struct {
}

// UpdateFormRequest holds the fields that can be updated on a form.
type UpdateFormRequest struct {
	ID string `json:"id"`
}
