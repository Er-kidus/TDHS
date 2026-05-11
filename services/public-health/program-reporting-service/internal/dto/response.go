package dto

// ProgramReportingResponse is the standard response payload for a single program-reporting.
type ProgramReportingResponse struct {
	ID string `json:"id"`
}

// ListProgramReportingResponse is the response payload for a list of program-reportings.
type ListProgramReportingResponse struct {
	Items []ProgramReportingResponse `json:"items"`
	Total int                       `json:"total"`
}
