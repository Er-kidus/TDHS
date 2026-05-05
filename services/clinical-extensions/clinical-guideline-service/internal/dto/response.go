package dto

// ClinicalGuidelineResponse is the standard response payload for a single clinical-guideline.
type ClinicalGuidelineResponse struct {
	ID string `json:"id"`
}

// ListClinicalGuidelineResponse is the response payload for a list of clinical-guidelines.
type ListClinicalGuidelineResponse struct {
	Items []ClinicalGuidelineResponse `json:"items"`
	Total int                       `json:"total"`
}
