package dto

// CreateRadiologyWorkflowRequest holds the fields required to create a radiology-workflow.
type CreateRadiologyWorkflowRequest struct {
}

// UpdateRadiologyWorkflowRequest holds the fields that can be updated on a radiology-workflow.
type UpdateRadiologyWorkflowRequest struct {
	ID string `json:"id"`
}
