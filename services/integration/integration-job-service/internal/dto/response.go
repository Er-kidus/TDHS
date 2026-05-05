package dto

// IntegrationJobResponse is the standard response payload for a single integration-job.
type IntegrationJobResponse struct {
	ID string `json:"id"`
}

// ListIntegrationJobResponse is the response payload for a list of integration-jobs.
type ListIntegrationJobResponse struct {
	Items []IntegrationJobResponse `json:"items"`
	Total int                       `json:"total"`
}
