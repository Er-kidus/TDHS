package dto

// ClaimsResponse is the standard response payload for a single claims.
type ClaimsResponse struct {
	ID string `json:"id"`
}

// ListClaimsResponse is the response payload for a list of claimss.
type ListClaimsResponse struct {
	Items []ClaimsResponse `json:"items"`
	Total int                       `json:"total"`
}
