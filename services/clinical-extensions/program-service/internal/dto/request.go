package dto

// CreateProgramRequest holds the fields required to create a program.
type CreateProgramRequest struct {
}

// UpdateProgramRequest holds the fields that can be updated on a program.
type UpdateProgramRequest struct {
	ID string `json:"id"`
}
