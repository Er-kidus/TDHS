package dto

// CreateNursingRequest holds the fields required to create a nursing.
type CreateNursingRequest struct {
}

// UpdateNursingRequest holds the fields that can be updated on a nursing.
type UpdateNursingRequest struct {
	ID string `json:"id"`
}
