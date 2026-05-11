package dto

// ReferralResponse is the standard response payload for a single referral.
type ReferralResponse struct {
	ID string `json:"id"`
}

// ListReferralResponse is the response payload for a list of referrals.
type ListReferralResponse struct {
	Items []ReferralResponse `json:"items"`
	Total int                       `json:"total"`
}
