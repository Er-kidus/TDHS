package dto

// InsuranceEligibilityResponse is the standard response payload for a single insurance-eligibility.
type InsuranceEligibilityResponse struct {
	ID string `json:"id"`
}

// ListInsuranceEligibilityResponse is the response payload for a list of insurance-eligibilitys.
type ListInsuranceEligibilityResponse struct {
	Items []InsuranceEligibilityResponse `json:"items"`
	Total int                       `json:"total"`
}
