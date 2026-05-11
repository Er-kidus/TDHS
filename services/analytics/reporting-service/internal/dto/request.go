package dto

// CreateReportingRequest holds the fields required to create a reporting.
type CreateReportingRequest struct {
}

// UpdateReportingRequest holds the fields that can be updated on a reporting.
type UpdateReportingRequest struct {
	ID string `json:"id"`
}
