package dto

// ReportingResponse is the standard response payload for a single reporting.
type ReportingResponse struct {
	ID string `json:"id"`
}

// ListReportingResponse is the response payload for a list of reportings.
type ListReportingResponse struct {
	Items []ReportingResponse `json:"items"`
	Total int                       `json:"total"`
}
