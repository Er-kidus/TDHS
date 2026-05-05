package dto

// CreateClaimAdjudicationRequest holds the fields required to create a claim-adjudication.
type CreateClaimAdjudicationRequest struct {
}

// UpdateClaimAdjudicationRequest holds the fields that can be updated on a claim-adjudication.
type UpdateClaimAdjudicationRequest struct {
	ID string `json:"id"`
}
