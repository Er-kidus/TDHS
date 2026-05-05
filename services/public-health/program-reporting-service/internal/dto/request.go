package dto

// CreateProgramReportingRequest holds the fields required to create a program-reporting.
type CreateProgramReportingRequest struct {
}

// UpdateProgramReportingRequest holds the fields that can be updated on a program-reporting.
type UpdateProgramReportingRequest struct {
	ID string `json:"id"`
}
