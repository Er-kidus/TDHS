package dto

// ClaimAdjudicationResponse is the standard response payload for a single claim-adjudication.
type ClaimAdjudicationResponse struct {
	ID string `json:"id"`
}

// ListClaimAdjudicationResponse is the response payload for a list of claim-adjudications.
type ListClaimAdjudicationResponse struct {
	Items []ClaimAdjudicationResponse `json:"items"`
	Total int                       `json:"total"`
}
