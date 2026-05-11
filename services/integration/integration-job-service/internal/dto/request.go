package dto

// CreateIntegrationJobRequest holds the fields required to create a integration-job.
type CreateIntegrationJobRequest struct {
}

// UpdateIntegrationJobRequest holds the fields that can be updated on a integration-job.
type UpdateIntegrationJobRequest struct {
	ID string `json:"id"`
}
