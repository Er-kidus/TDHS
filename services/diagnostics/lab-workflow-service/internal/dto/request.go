package dto

// CreateLabWorkflowRequest holds the fields required to create a lab-workflow.
type CreateLabWorkflowRequest struct {
}

// UpdateLabWorkflowRequest holds the fields that can be updated on a lab-workflow.
type UpdateLabWorkflowRequest struct {
	ID string `json:"id"`
}
