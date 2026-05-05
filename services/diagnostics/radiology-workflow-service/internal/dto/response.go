package dto

// RadiologyWorkflowResponse is the standard response payload for a single radiology-workflow.
type RadiologyWorkflowResponse struct {
	ID string `json:"id"`
}

// ListRadiologyWorkflowResponse is the response payload for a list of radiology-workflows.
type ListRadiologyWorkflowResponse struct {
	Items []RadiologyWorkflowResponse `json:"items"`
	Total int                       `json:"total"`
}
