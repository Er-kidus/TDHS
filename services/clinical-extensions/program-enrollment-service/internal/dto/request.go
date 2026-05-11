package dto

// CreateProgramEnrollmentRequest holds the fields required to create a program-enrollment.
type CreateProgramEnrollmentRequest struct {
}

// UpdateProgramEnrollmentRequest holds the fields that can be updated on a program-enrollment.
type UpdateProgramEnrollmentRequest struct {
	ID string `json:"id"`
}
