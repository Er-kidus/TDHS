package dto

// CreateReferralRequest holds the fields required to create a referral.
type CreateReferralRequest struct {
}

// UpdateReferralRequest holds the fields that can be updated on a referral.
type UpdateReferralRequest struct {
	ID string `json:"id"`
}
