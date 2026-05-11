package dto

// LabWorkflowResponse is the standard response payload for a single lab-workflow.
type LabWorkflowResponse struct {
	ID string `json:"id"`
}

// ListLabWorkflowResponse is the response payload for a list of lab-workflows.
type ListLabWorkflowResponse struct {
	Items []LabWorkflowResponse `json:"items"`
	Total int                       `json:"total"`
}
