package dto

// ProgramEnrollmentResponse is the standard response payload for a single program-enrollment.
type ProgramEnrollmentResponse struct {
	ID string `json:"id"`
}

// ListProgramEnrollmentResponse is the response payload for a list of program-enrollments.
type ListProgramEnrollmentResponse struct {
	Items []ProgramEnrollmentResponse `json:"items"`
	Total int                       `json:"total"`
}
