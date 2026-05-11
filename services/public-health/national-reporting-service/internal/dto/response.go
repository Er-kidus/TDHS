package dto

// NationalReportingResponse is the standard response payload for a single national-reporting.
type NationalReportingResponse struct {
	ID string `json:"id"`
}

// ListNationalReportingResponse is the response payload for a list of national-reportings.
type ListNationalReportingResponse struct {
	Items []NationalReportingResponse `json:"items"`
	Total int                       `json:"total"`
}
